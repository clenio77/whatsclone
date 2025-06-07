# 👨‍💼 Guia de Administração - WhatsClone

Este guia detalha como usar o sistema de administração do WhatsClone para gerenciar usuários, monitorar segurança e administrar o sistema.

## 🚀 Acesso ao Painel Administrativo

### **1. Criar Usuário Administrador**

```bash
# No diretório server
cd server
npm run create-admin
```

**Credenciais padrão criadas:**
- **Email**: admin@whatsclone.com
- **Senha**: admin123456
- **⚠️ IMPORTANTE**: Altere a senha após o primeiro login!

### **2. Fazer Login como Admin**

1. Acesse o WhatsClone normalmente
2. Faça login com as credenciais de admin
3. Clique no ícone 🛡️ (Shield) no canto superior direito
4. Você será redirecionado para `/admin`

## 🎛️ Funcionalidades do Painel

### **📊 Dashboard**

O dashboard principal (`/admin`) oferece uma visão geral completa:

#### **Estatísticas Gerais**
- **Total de Usuários** - Número total de usuários registrados
- **Usuários Online** - Usuários atualmente conectados
- **Total de Chats** - Conversas criadas
- **Total de Mensagens** - Mensagens enviadas
- **Bots IA** - Assistentes IA criados

#### **Crescimento (30 dias)**
- **Novos Usuários** - Registros recentes
- **Novos Chats** - Conversas criadas
- **Novas Mensagens** - Atividade de mensagens

#### **Segurança (24 horas)**
- **Eventos de Segurança** - Tentativas de ataque, falhas de login
- **Eventos por Severidade** - CRITICAL, HIGH, MEDIUM, LOW, INFO
- **Sessões Ativas** - Usuários conectados simultaneamente

#### **Usuários Recentes**
- Lista dos 10 usuários mais recentes
- Status de verificação e online
- Informações básicas

### **👥 Gerenciamento de Usuários**

Acesse em `/admin/users` para gerenciar todos os usuários:

#### **Funcionalidades Disponíveis:**

##### **🔍 Busca e Filtros**
- **Busca por texto** - Nome, email ou telefone
- **Filtro por status**:
  - Verificados / Não verificados
  - Online / Offline
  - Bloqueados / Ativos
- **Filtro por role**:
  - Usuários comuns
  - Administradores

##### **📋 Lista de Usuários**
Cada usuário exibe:
- **Avatar e informações** - Nome, email
- **Role** - Usuário ou Admin
- **Status de verificação** - ✅ Verificado / ❌ Não verificado
- **Status online** - 🟢 Online / ⚫ Offline
- **Status da conta** - Ativo / Bloqueado
- **Data de criação**

##### **⚙️ Ações por Usuário**
- **✏️ Editar** - Alterar dados, role, status
- **🛡️ Revogar Sessões** - Desconectar de todos os dispositivos
- **🗑️ Deletar** - Remover usuário permanentemente

#### **Edição de Usuários**

Ao clicar em "Editar", você pode alterar:

- **Nome** - Nome de exibição
- **Email** - Endereço de email
- **Role** - user ou admin
- **Verificação** - Marcar como verificado
- **Bloqueio** - Bloquear/desbloquear conta
- **Motivo do bloqueio** - Razão do bloqueio

**⚠️ Restrições de Segurança:**
- Admins não podem alterar seu próprio role
- Admins não podem deletar sua própria conta
- Bloqueio de conta revoga todas as sessões automaticamente

### **🔒 Monitoramento de Segurança**

#### **Logs de Segurança**
Todos os eventos são registrados:

```bash
# Visualizar logs em tempo real
tail -f server/logs/security.log

# Buscar eventos específicos
grep "ATTACK_DETECTED" server/logs/security.log
grep "LOGIN_FAILED" server/logs/security.log
```

#### **Tipos de Eventos Monitorados**
- **ATTACK_DETECTED** - Tentativas de XSS, injection, etc.
- **RATE_LIMIT_EXCEEDED** - Excesso de requisições
- **LOGIN_FAILED** - Falhas de autenticação
- **BLACKLISTED_TOKEN_USED** - Uso de tokens revogados
- **USER_UPDATED_BY_ADMIN** - Alterações feitas por admin
- **ADMIN_ACCESS_GRANTED** - Acessos ao painel admin

#### **Alertas Automáticos**
O sistema gera alertas quando:
- **10+ rate limits** em 5 minutos
- **3+ ataques detectados** em 1 minuto
- **5+ tokens blacklisted** em 5 minutos
- **20+ validações falharam** em 5 minutos

## 🛠️ Operações Administrativas

### **Gerenciar Sessões de Usuário**

```bash
# Via API (com token de admin)
curl -X DELETE /api/admin/users/:userId/revoke-sessions \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### **Bloquear Usuário Suspeito**

1. Acesse `/admin/users`
2. Encontre o usuário
3. Clique em "Editar"
4. Marque "Bloqueado"
5. Adicione motivo do bloqueio
6. Salvar

**Efeitos do bloqueio:**
- Usuário não consegue fazer login
- Todas as sessões são revogadas
- Tentativas de acesso são logadas

### **Promover Usuário a Admin**

1. Acesse `/admin/users`
2. Encontre o usuário
3. Clique em "Editar"
4. Altere Role para "Administrador"
5. Salvar

**⚠️ Cuidado:** Admins têm acesso total ao sistema!

### **Monitorar Atividade Suspeita**

#### **Indicadores de Alerta:**
- Múltiplas falhas de login
- Tentativas de ataques (XSS, injection)
- Uso de tokens revogados
- Excesso de requisições

#### **Ações Recomendadas:**
1. **Investigar logs** - Verificar padrões suspeitos
2. **Bloquear IP** - Se necessário (via firewall)
3. **Bloquear usuário** - Se comprometido
4. **Revogar sessões** - Forçar novo login

## 📊 APIs de Administração

### **Dashboard**
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

### **Listar Usuários**
```http
GET /api/admin/users?page=1&limit=20&search=termo&status=verified&role=user
Authorization: Bearer <admin_token>
```

### **Detalhes do Usuário**
```http
GET /api/admin/users/:userId
Authorization: Bearer <admin_token>
```

### **Atualizar Usuário**
```http
PUT /api/admin/users/:userId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Novo Nome",
  "role": "admin",
  "isLocked": true,
  "lockReason": "Atividade suspeita"
}
```

### **Deletar Usuário**
```http
DELETE /api/admin/users/:userId
Authorization: Bearer <admin_token>
```

### **Revogar Sessões**
```http
POST /api/admin/users/:userId/revoke-sessions
Authorization: Bearer <admin_token>
```

## 🔐 Segurança do Painel Admin

### **Controle de Acesso**
- Apenas usuários com `role: 'admin'` podem acessar
- Todas as ações são logadas com IP e timestamp
- Tokens JWT com expiração curta (15 minutos)
- Rate limiting específico para endpoints admin

### **Auditoria**
Todas as ações administrativas são registradas:
- Quem fez a ação (admin ID)
- O que foi alterado
- Quando foi feito
- IP de origem

### **Boas Práticas**
1. **Altere a senha padrão** imediatamente
2. **Use senhas fortes** (12+ caracteres)
3. **Monitore logs regularmente**
4. **Revogue sessões suspeitas**
5. **Mantenha poucos admins** (princípio do menor privilégio)
6. **Faça backup dos logs** regularmente

## 🚨 Resposta a Incidentes

### **Usuário Comprometido**
1. Bloquear conta imediatamente
2. Revogar todas as sessões
3. Investigar logs de atividade
4. Notificar usuário por email
5. Documentar incidente

### **Ataque Detectado**
1. Verificar logs de segurança
2. Identificar padrão de ataque
3. Bloquear IPs suspeitos (firewall)
4. Aumentar monitoramento
5. Atualizar regras de segurança

### **Admin Comprometido**
1. **EMERGÊNCIA** - Revogar todas as sessões admin
2. Alterar senhas de todos os admins
3. Investigar escopo do comprometimento
4. Revisar todas as ações recentes
5. Implementar autenticação 2FA

## 📞 Suporte e Contato

Para questões administrativas:
- **Email**: admin@whatsclone.com
- **Logs**: `server/logs/security.log`
- **Documentação**: `SECURITY.md`

## 🎯 Checklist do Administrador

### **Diário**
- [ ] Verificar alertas de segurança
- [ ] Revisar usuários recentes
- [ ] Monitorar estatísticas de uso

### **Semanal**
- [ ] Analisar logs de segurança
- [ ] Revisar usuários bloqueados
- [ ] Verificar crescimento de usuários
- [ ] Backup dos logs

### **Mensal**
- [ ] Auditoria de usuários admin
- [ ] Revisão de políticas de segurança
- [ ] Atualização de dependências
- [ ] Relatório de atividade

**👨‍💼 O painel administrativo oferece controle total e seguro sobre o WhatsClone!**
