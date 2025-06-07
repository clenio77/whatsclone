const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class SecurityLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.securityLogFile = path.join(this.logDir, 'security.log');
    this.alertLogFile = path.join(this.logDir, 'security-alerts.log');
    this.maxLogSize = 10 * 1024 * 1024; // 10MB
    this.maxLogFiles = 5;
    this.alertThresholds = {
      RATE_LIMIT_EXCEEDED: { count: 10, window: 300000 }, // 10 em 5 min
      ATTACK_DETECTED: { count: 3, window: 60000 }, // 3 em 1 min
      BLACKLISTED_TOKEN_USED: { count: 5, window: 300000 }, // 5 em 5 min
      VALIDATION_FAILED: { count: 20, window: 300000 } // 20 em 5 min
    };
    this.eventCounts = new Map();
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
      console.log('✅ Diretório de logs de segurança criado');
    } catch (error) {
      console.error('❌ Erro ao criar diretório de logs:', error);
    }
  }

  // Log de eventos de segurança
  async logSecurityEvent(eventType, details = {}) {
    const timestamp = new Date().toISOString();
    const eventId = crypto.randomUUID();
    
    const logEntry = {
      id: eventId,
      timestamp,
      type: eventType,
      severity: this.getSeverity(eventType),
      details: {
        ...details,
        timestamp
      }
    };

    // Escrever no log principal
    await this.writeToLog(this.securityLogFile, logEntry);

    // Verificar se precisa gerar alerta
    await this.checkForAlerts(eventType, details);

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔒 [SECURITY] ${eventType}:`, details);
    }

    return eventId;
  }

  // Determinar severidade do evento
  getSeverity(eventType) {
    const severityMap = {
      'ATTACK_DETECTED': 'CRITICAL',
      'BLACKLISTED_TOKEN_USED': 'HIGH',
      'CSRF_ATTEMPT': 'HIGH',
      'RATE_LIMIT_EXCEEDED': 'MEDIUM',
      'VALIDATION_FAILED': 'LOW',
      'SENSITIVE_ENDPOINT_ACCESS': 'INFO',
      'LOGIN_SUCCESS': 'INFO',
      'LOGIN_FAILED': 'MEDIUM',
      'LOGOUT': 'INFO',
      'SESSION_CREATED': 'INFO',
      'SESSION_REVOKED': 'MEDIUM',
      'PASSWORD_CHANGED': 'MEDIUM',
      'ACCOUNT_LOCKED': 'HIGH',
      'SUSPICIOUS_ACTIVITY': 'HIGH'
    };

    return severityMap[eventType] || 'UNKNOWN';
  }

  // Verificar se deve gerar alertas
  async checkForAlerts(eventType, details) {
    const threshold = this.alertThresholds[eventType];
    if (!threshold) return;

    const now = Date.now();
    const key = `${eventType}:${details.ip || 'unknown'}`;
    
    // Limpar contadores antigos
    this.cleanOldCounts(now);

    // Incrementar contador
    if (!this.eventCounts.has(key)) {
      this.eventCounts.set(key, []);
    }
    
    const counts = this.eventCounts.get(key);
    counts.push(now);

    // Verificar se excedeu o threshold
    const recentCounts = counts.filter(time => now - time <= threshold.window);
    this.eventCounts.set(key, recentCounts);

    if (recentCounts.length >= threshold.count) {
      await this.generateAlert(eventType, details, recentCounts.length);
    }
  }

  // Gerar alerta de segurança
  async generateAlert(eventType, details, count) {
    const alert = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'SECURITY_ALERT',
      severity: 'CRITICAL',
      eventType,
      count,
      details,
      message: `Múltiplas ocorrências de ${eventType} detectadas: ${count} eventos`
    };

    await this.writeToLog(this.alertLogFile, alert);

    // Enviar notificação (implementar conforme necessário)
    await this.sendAlert(alert);

    console.error(`🚨 ALERTA DE SEGURANÇA: ${eventType} - ${count} ocorrências`);
  }

  // Enviar alerta (webhook, email, etc.)
  async sendAlert(alert) {
    try {
      // Implementar notificações conforme necessário
      // Webhook, email, Slack, etc.
      
      if (process.env.SECURITY_WEBHOOK_URL) {
        // Usar axios em vez de fetch para compatibilidade
        const axios = require('axios');
        await axios.post(process.env.SECURITY_WEBHOOK_URL, alert, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        });
      }
    } catch (error) {
      console.error('Erro ao enviar alerta:', error);
    }
  }

  // Escrever no arquivo de log
  async writeToLog(logFile, entry) {
    try {
      const logLine = JSON.stringify(entry) + '\n';
      
      // Verificar tamanho do arquivo
      try {
        const stats = await fs.stat(logFile);
        if (stats.size > this.maxLogSize) {
          await this.rotateLog(logFile);
        }
      } catch (error) {
        // Arquivo não existe, será criado
      }

      await fs.appendFile(logFile, logLine);
    } catch (error) {
      console.error('Erro ao escrever log:', error);
    }
  }

  // Rotacionar logs
  async rotateLog(logFile) {
    try {
      const ext = path.extname(logFile);
      const base = path.basename(logFile, ext);
      const dir = path.dirname(logFile);

      // Mover logs existentes
      for (let i = this.maxLogFiles - 1; i >= 1; i--) {
        const oldFile = path.join(dir, `${base}.${i}${ext}`);
        const newFile = path.join(dir, `${base}.${i + 1}${ext}`);
        
        try {
          await fs.rename(oldFile, newFile);
        } catch (error) {
          // Arquivo não existe, continuar
        }
      }

      // Mover arquivo atual
      const firstRotated = path.join(dir, `${base}.1${ext}`);
      await fs.rename(logFile, firstRotated);

      // Remover arquivo mais antigo se necessário
      const oldestFile = path.join(dir, `${base}.${this.maxLogFiles + 1}${ext}`);
      try {
        await fs.unlink(oldestFile);
      } catch (error) {
        // Arquivo não existe, ok
      }
    } catch (error) {
      console.error('Erro ao rotacionar log:', error);
    }
  }

  // Limpar contadores antigos
  cleanOldCounts(now) {
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    for (const [key, counts] of this.eventCounts.entries()) {
      const recentCounts = counts.filter(time => now - time <= maxAge);
      if (recentCounts.length === 0) {
        this.eventCounts.delete(key);
      } else {
        this.eventCounts.set(key, recentCounts);
      }
    }
  }

  // Obter estatísticas de segurança
  async getSecurityStats(hours = 24) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      const logs = await this.readLogs(this.securityLogFile, since);
      
      const stats = {
        totalEvents: logs.length,
        eventsByType: {},
        eventsBySeverity: {},
        topIPs: {},
        timeline: []
      };

      logs.forEach(log => {
        // Por tipo
        stats.eventsByType[log.type] = (stats.eventsByType[log.type] || 0) + 1;
        
        // Por severidade
        stats.eventsBySeverity[log.severity] = (stats.eventsBySeverity[log.severity] || 0) + 1;
        
        // Por IP
        const ip = log.details.ip || 'unknown';
        stats.topIPs[ip] = (stats.topIPs[ip] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return null;
    }
  }

  // Ler logs desde uma data
  async readLogs(logFile, since) {
    try {
      const content = await fs.readFile(logFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line);
      
      return lines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(log => log && new Date(log.timestamp) >= since);
    } catch (error) {
      return [];
    }
  }

  // Buscar eventos específicos
  async searchEvents(criteria = {}) {
    try {
      const { type, severity, ip, since, limit = 100 } = criteria;
      const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const logs = await this.readLogs(this.securityLogFile, sinceDate);
      
      let filtered = logs;
      
      if (type) {
        filtered = filtered.filter(log => log.type === type);
      }
      
      if (severity) {
        filtered = filtered.filter(log => log.severity === severity);
      }
      
      if (ip) {
        filtered = filtered.filter(log => log.details.ip === ip);
      }

      return filtered
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      return [];
    }
  }
}

// Instância singleton
const securityLogger = new SecurityLogger();

module.exports = securityLogger;
