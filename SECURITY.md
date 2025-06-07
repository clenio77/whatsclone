# 🔒 Guia de Segurança - WhatsClone

Este documento detalha todas as medidas de segurança implementadas no WhatsClone para proteger contra ataques e vulnerabilidades.

## 🛡️ Medidas de Segurança Implementadas

### **1. Autenticação e Autorização**

#### **JWT com Blacklist**
- ✅ **Tokens revogáveis** - Sistema de blacklist para invalidar tokens
- ✅ **Controle de sessões** - Máximo 5 sessões simultâneas por usuário
- ✅ **Expiração automática** - Tokens com tempo de vida limitado
- ✅ **Refresh tokens** - Renovação segura de tokens

#### **Controle de Acesso**
- ✅ **Roles de usuário** - Sistema de permissões (user/admin)
- ✅ **Middleware de autenticação** - Verificação em todas as rotas protegidas
- ✅ **Verificação de conta** - Usuários devem verificar telefone

### **2. Proteção contra Ataques**

#### **Rate Limiting Avançado**
- ✅ **Por endpoint** - Limites específicos para cada tipo de operação
- ✅ **Por IP** - Prevenção de spam e ataques de força bruta
- ✅ **Slow down** - Aumento progressivo de delay para tentativas excessivas

```javascript
// Limites implementados:
- Autenticação: 5 tentativas / 15 minutos
- API geral: 100 requests / 15 minutos  
- Mensagens: 30 mensagens / minuto
- IA: 10 requests / minuto
```

#### **Sanitização de Dados**
- ✅ **Anti-XSS** - Remoção de scripts maliciosos
- ✅ **Anti-NoSQL Injection** - Sanitização de queries MongoDB
- ✅ **Validação de entrada** - Verificação rigorosa de todos os inputs
- ✅ **Detecção de ataques** - Padrões suspeitos são bloqueados

#### **Proteção CSRF**
- ✅ **Verificação de origem** - Validação de headers Origin/Referer
- ✅ **Tokens CSRF** - Proteção contra requisições maliciosas
- ✅ **SameSite cookies** - Configuração segura de cookies

### **3. Headers de Segurança**

#### **Content Security Policy (CSP)**
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ws: wss:; frame-ancestors 'none';
```

#### **Outros Headers**
- ✅ **X-Content-Type-Options**: nosniff
- ✅ **X-Frame-Options**: DENY
- ✅ **X-XSS-Protection**: 1; mode=block
- ✅ **Strict-Transport-Security**: HTTPS obrigatório em produção
- ✅ **Referrer-Policy**: strict-origin-when-cross-origin

### **4. Upload de Arquivos Seguro**

#### **Validações Implementadas**
- ✅ **Tipos permitidos** - Apenas formatos seguros (imagens, PDFs)
- ✅ **Tamanho máximo** - Limite de 5MB por arquivo
- ✅ **Assinatura de arquivo** - Verificação de magic bytes
- ✅ **Scan de malware** - Detecção de conteúdo suspeito
- ✅ **Processamento de imagens** - Remoção de metadados EXIF

#### **Tipos Permitidos**
```javascript
Imagens: JPEG, PNG, GIF, WebP
Documentos: PDF, TXT, DOC, DOCX
Máximo: 5MB por arquivo, 5 arquivos por upload
```

### **5. Logging e Monitoramento**

#### **Eventos Monitorados**
- ✅ **Tentativas de login** - Sucessos e falhas
- ✅ **Ataques detectados** - XSS, injection, etc.
- ✅ **Rate limiting** - Excesso de requisições
- ✅ **Acessos administrativos** - Operações sensíveis
- ✅ **Alterações de segurança** - Mudanças de senha, revogação de sessões

#### **Sistema de Alertas**
- ✅ **Thresholds automáticos** - Alertas baseados em frequência
- ✅ **Logs estruturados** - JSON para análise automatizada
- ✅ **Rotação de logs** - Gerenciamento automático de espaço
- ✅ **Webhooks** - Notificações em tempo real

### **6. Criptografia e Hashing**

#### **Senhas**
- ✅ **bcrypt** - Hash seguro com salt
- ✅ **Rounds configuráveis** - Ajuste de complexidade
- ✅ **Validação de força** - Mínimo 8 caracteres

#### **Tokens**
- ✅ **JWT assinado** - Chaves secretas seguras
- ✅ **Payload mínimo** - Apenas dados essenciais
- ✅ **Expiração curta** - Renovação frequente

## 🚨 Alertas de Segurança

### **Thresholds de Alerta**
```javascript
Rate Limit Exceeded: 10 ocorrências em 5 minutos
Attack Detected: 3 ocorrências em 1 minuto
Blacklisted Token Used: 5 ocorrências em 5 minutos
Validation Failed: 20 ocorrências em 5 minutos
```

### **Tipos de Alerta**
- 🔴 **CRITICAL** - Ataques detectados, tokens comprometidos
- 🟠 **HIGH** - Tentativas de CSRF, contas bloqueadas
- 🟡 **MEDIUM** - Rate limiting, falhas de login
- 🔵 **LOW** - Validações falhadas
- ⚪ **INFO** - Acessos normais, logs de auditoria

## 🔧 Configuração de Segurança

### **Variáveis de Ambiente**
```env
# JWT
JWT_SECRET=sua-chave-super-secreta-min-32-chars
JWT_REFRESH_SECRET=sua-chave-refresh-super-secreta
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Redis (para blacklist)
REDIS_URL=redis://localhost:6379

# Webhooks de segurança
SECURITY_WEBHOOK_URL=https://seu-webhook.com/security

# CORS
CORS_ORIGIN=http://localhost:3000,https://seu-dominio.com
```

### **Configurações Recomendadas**

#### **Desenvolvimento**
```env
NODE_ENV=development
JWT_EXPIRE=1h
RATE_LIMIT_MAX_REQUESTS=1000
```

#### **Produção**
```env
NODE_ENV=production
JWT_EXPIRE=15m
RATE_LIMIT_MAX_REQUESTS=100
REDIS_URL=redis://seu-redis-producao:6379
```

## 📊 Monitoramento

### **Endpoints de Segurança**

#### **Usuário**
- `GET /api/security/sessions` - Listar sessões ativas
- `DELETE /api/security/sessions/:id` - Revogar sessão específica
- `DELETE /api/security/sessions` - Revogar todas as sessões
- `GET /api/security/events` - Eventos de segurança do usuário
- `POST /api/security/change-password` - Alterar senha

#### **Administrador**
- `GET /api/security/stats` - Estatísticas de segurança
- `GET /api/security/alerts` - Alertas de segurança

### **Logs de Segurança**
```bash
# Localização dos logs
server/logs/security.log        # Log principal
server/logs/security-alerts.log # Alertas críticos

# Visualizar logs em tempo real
tail -f server/logs/security.log

# Buscar eventos específicos
grep "ATTACK_DETECTED" server/logs/security.log
```

## 🛠️ Manutenção de Segurança

### **Tarefas Regulares**
- [ ] **Rotação de chaves JWT** - A cada 90 dias
- [ ] **Análise de logs** - Semanal
- [ ] **Atualização de dependências** - Mensal
- [ ] **Teste de penetração** - Trimestral
- [ ] **Backup de logs** - Diário

### **Checklist de Segurança**
- [ ] Todas as senhas são hasheadas com bcrypt
- [ ] JWT secrets são únicos e seguros (32+ caracteres)
- [ ] Rate limiting está ativo em produção
- [ ] HTTPS está configurado (produção)
- [ ] Logs de segurança estão funcionando
- [ ] Alertas estão configurados
- [ ] Backups estão funcionando
- [ ] Dependências estão atualizadas

## 🚨 Resposta a Incidentes

### **Procedimentos**
1. **Detecção** - Alertas automáticos ou análise manual
2. **Contenção** - Bloquear IPs, revogar tokens
3. **Investigação** - Analisar logs, identificar escopo
4. **Erradicação** - Corrigir vulnerabilidades
5. **Recuperação** - Restaurar serviços seguros
6. **Lições aprendidas** - Documentar e melhorar

### **Comandos de Emergência**
```bash
# Bloquear usuário específico
curl -X POST /api/admin/users/:id/lock \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Revogar todas as sessões de um usuário
curl -X DELETE /api/security/sessions \
  -H "Authorization: Bearer $USER_TOKEN"

# Ver alertas críticos
curl -X GET /api/security/alerts?severity=CRITICAL \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 📞 Contato de Segurança

Para reportar vulnerabilidades de segurança:
- **Email**: security@whatsclone.com
- **Responsável**: Equipe de Segurança
- **Tempo de resposta**: 24 horas para vulnerabilidades críticas

**🔒 A segurança é nossa prioridade máxima!**
