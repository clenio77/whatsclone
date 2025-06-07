const jwt = require('jsonwebtoken');

class TokenBlacklistService {
  constructor() {
    this.client = null;
    this.memoryBlacklist = new Set(); // Fallback para desenvolvimento
    this.sessionStore = new Map(); // Controle de sessões ativas
    this.maxSessionsPerUser = 5; // Máximo de sessões simultâneas
    this.initRedis();
  }

  async initRedis() {
    try {
      if (process.env.REDIS_URL) {
        const redis = require('redis');
        this.client = redis.createClient({
          url: process.env.REDIS_URL
        });
        
        this.client.on('error', (err) => {
          console.error('Redis Client Error:', err);
          this.client = null;
        });
        
        await this.client.connect();
        console.log('✅ Redis conectado para blacklist de tokens');
      } else {
        console.warn('⚠️ Redis não configurado - usando blacklist em memória');
      }
    } catch (error) {
      console.error('❌ Erro ao conectar Redis:', error);
      this.client = null;
    }
  }

  // Adicionar token à blacklist
  async addToBlacklist(token, reason = 'logout') {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return false;

      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl <= 0) return true; // Token já expirado

      const key = `blacklist:${this.getTokenHash(token)}`;
      const value = JSON.stringify({
        userId: decoded.id,
        reason,
        blacklistedAt: new Date().toISOString()
      });

      if (this.client) {
        await this.client.setEx(key, ttl, value);
      } else {
        this.memoryBlacklist.add(this.getTokenHash(token));
        // Limpar da memória após expiração
        setTimeout(() => {
          this.memoryBlacklist.delete(this.getTokenHash(token));
        }, ttl * 1000);
      }

      // Remover da lista de sessões ativas
      this.removeActiveSession(decoded.id, token);

      return true;
    } catch (error) {
      console.error('Erro ao adicionar token à blacklist:', error);
      return false;
    }
  }

  // Verificar se token está na blacklist
  async isBlacklisted(token) {
    try {
      const tokenHash = this.getTokenHash(token);

      if (this.client) {
        const result = await this.client.get(`blacklist:${tokenHash}`);
        return !!result;
      } else {
        return this.memoryBlacklist.has(tokenHash);
      }
    } catch (error) {
      console.error('Erro ao verificar blacklist:', error);
      return false;
    }
  }

  // Adicionar sessão ativa
  addActiveSession(userId, token, deviceInfo = {}) {
    const decoded = jwt.decode(token);
    if (!decoded) return false;

    const sessionId = this.getTokenHash(token);
    const userSessions = this.sessionStore.get(userId) || new Map();

    // Limitar número de sessões por usuário
    if (userSessions.size >= this.maxSessionsPerUser) {
      // Remover sessão mais antiga
      const oldestSession = Array.from(userSessions.entries())[0];
      this.addToBlacklist(oldestSession[1].token, 'session_limit');
      userSessions.delete(oldestSession[0]);
    }

    userSessions.set(sessionId, {
      token,
      createdAt: new Date(),
      lastActivity: new Date(),
      deviceInfo: {
        userAgent: deviceInfo.userAgent || 'unknown',
        ip: deviceInfo.ip || 'unknown',
        platform: deviceInfo.platform || 'unknown'
      },
      expiresAt: new Date(decoded.exp * 1000)
    });

    this.sessionStore.set(userId, userSessions);
    return sessionId;
  }

  // Remover sessão ativa
  removeActiveSession(userId, token) {
    const sessionId = this.getTokenHash(token);
    const userSessions = this.sessionStore.get(userId);
    
    if (userSessions) {
      userSessions.delete(sessionId);
      if (userSessions.size === 0) {
        this.sessionStore.delete(userId);
      }
    }
  }

  // Obter sessões ativas do usuário
  getActiveSessions(userId) {
    const userSessions = this.sessionStore.get(userId);
    if (!userSessions) return [];

    return Array.from(userSessions.values()).map(session => ({
      id: this.getTokenHash(session.token),
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      deviceInfo: session.deviceInfo,
      expiresAt: session.expiresAt,
      isCurrent: false // Será marcado pelo middleware
    }));
  }

  // Revogar todas as sessões de um usuário
  async revokeAllUserSessions(userId, exceptToken = null) {
    const userSessions = this.sessionStore.get(userId);
    if (!userSessions) return 0;

    let revokedCount = 0;
    const exceptHash = exceptToken ? this.getTokenHash(exceptToken) : null;

    for (const [sessionId, session] of userSessions.entries()) {
      if (sessionId !== exceptHash) {
        await this.addToBlacklist(session.token, 'revoke_all');
        revokedCount++;
      }
    }

    // Manter apenas a sessão atual (se especificada)
    if (exceptToken && exceptHash) {
      const currentSession = userSessions.get(exceptHash);
      userSessions.clear();
      if (currentSession) {
        userSessions.set(exceptHash, currentSession);
      }
    } else {
      userSessions.clear();
    }

    return revokedCount;
  }

  // Atualizar atividade da sessão
  updateSessionActivity(userId, token) {
    const sessionId = this.getTokenHash(token);
    const userSessions = this.sessionStore.get(userId);
    
    if (userSessions && userSessions.has(sessionId)) {
      const session = userSessions.get(sessionId);
      session.lastActivity = new Date();
      userSessions.set(sessionId, session);
    }
  }

  // Limpar sessões expiradas
  cleanupExpiredSessions() {
    const now = new Date();
    
    for (const [userId, userSessions] of this.sessionStore.entries()) {
      for (const [sessionId, session] of userSessions.entries()) {
        if (session.expiresAt < now) {
          userSessions.delete(sessionId);
        }
      }
      
      if (userSessions.size === 0) {
        this.sessionStore.delete(userId);
      }
    }
  }

  // Hash do token para usar como chave
  getTokenHash(token) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex').substring(0, 16);
  }

  // Estatísticas de segurança
  getSecurityStats() {
    let totalSessions = 0;
    let totalUsers = this.sessionStore.size;
    
    for (const userSessions of this.sessionStore.values()) {
      totalSessions += userSessions.size;
    }

    return {
      totalUsers,
      totalSessions,
      averageSessionsPerUser: totalUsers > 0 ? (totalSessions / totalUsers).toFixed(2) : 0,
      blacklistSize: this.client ? 'redis' : this.memoryBlacklist.size
    };
  }
}

// Instância singleton
const tokenBlacklist = new TokenBlacklistService();

// Limpeza automática a cada hora
setInterval(() => {
  tokenBlacklist.cleanupExpiredSessions();
}, 60 * 60 * 1000);

module.exports = tokenBlacklist;
