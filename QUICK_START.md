# 🚀 Guia de Início Rápido - WhatsClone

Este guia permite que você teste o WhatsClone rapidamente em poucos minutos.

## ⚡ Setup Rápido (5 minutos)

### 1. **Clonar e Instalar**
```bash
git clone https://github.com/clenio77/whatsclone
cd whatsclone
./setup.sh  # Linux/Mac
# ou setup.bat no Windows
```

### 2. **Configurar Ambiente**
```bash
# Copiar configurações
cp .env.example .env

# Configurações mínimas necessárias:
# MONGODB_URI=mongodb://localhost:27017/whatsclone
# JWT_SECRET=sua-chave-secreta-aqui
```

### 3. **Iniciar Aplicação**
```bash
npm run dev
```

### 4. **Acessar**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 👤 Testando o Sistema

### **Criar Usuário Normal**
1. Acesse http://localhost:3000
2. Clique em "Registrar"
3. Preencha os dados
4. Use qualquer número (SMS será simulado)
5. Código de verificação: `123456`

### **Criar Usuário Admin**
```bash
cd server
npm run create-admin
```
**Credenciais**: admin@whatsclone.com / admin123456

## 💬 Testando Chat

### **Conversar com Outro Usuário**
1. Registre 2 usuários diferentes
2. Use abas diferentes do navegador
3. Busque o outro usuário
4. Inicie uma conversa
5. Teste mensagens em tempo real

### **Testar Recursos**
- ✅ **Mensagens** - Envio/recebimento instantâneo
- ✅ **Digitação** - Indicador "digitando..."
- ✅ **Status** - Online/offline automático
- ✅ **Busca** - Encontrar outros usuários

## 🤖 Testando IA

### **Configurar Groq (Gratuito)**
1. Acesse: https://console.groq.com/
2. Crie conta gratuita
3. Gere API key
4. Adicione no `.env`:
```env
GROQ_API_KEY=gsk_sua_key_aqui
VITE_AI_PROVIDER=groq
VITE_AI_API_KEY=gsk_sua_key_aqui
```

### **Usar Assistente**
1. Clique no ícone 🤖 no chat
2. Escolha um modo:
   - 🗣️ **Assistente** - Conversas gerais
   - 🌍 **Tradutor** - Traduzir textos
   - 📄 **Resumidor** - Resumir conteúdo
   - 💡 **Criativo** - Ideias e escrita
3. Digite sua pergunta
4. Clique "Enviar para chat" para compartilhar

## 👨‍💼 Testando Administração

### **Acessar Painel Admin**
1. Login com admin@whatsclone.com
2. Clique no ícone 🛡️ no chat
3. Acesse `/admin`

### **Funcionalidades Admin**
- 📊 **Dashboard** - Métricas do sistema
- 👥 **Usuários** - Gerenciar todos os usuários
- 🔍 **Buscar** - Filtrar por nome, email, status
- ✏️ **Editar** - Alterar dados, roles, bloqueios
- 🛡️ **Sessões** - Revogar acessos
- 🗑️ **Deletar** - Remover usuários

### **Testar Controles Admin**
1. **Promover usuário**: Role → Admin
2. **Bloquear conta**: Marcar "Bloqueado"
3. **Revogar sessões**: Desconectar usuário
4. **Ver estatísticas**: Dashboard com métricas

## 🔒 Testando Segurança

### **Rate Limiting**
1. Faça muitas requisições rápidas
2. Observe bloqueio temporário
3. Verifique logs: `server/logs/security.log`

### **Logs de Segurança**
```bash
# Ver logs em tempo real
tail -f server/logs/security.log

# Buscar eventos específicos
grep "RATE_LIMIT" server/logs/security.log
grep "LOGIN_FAILED" server/logs/security.log
```

### **Blacklist de Tokens**
1. Faça logout
2. Tente usar token antigo
3. Observe rejeição automática

## 🎯 Cenários de Teste

### **Cenário 1: Chat Básico**
1. Registrar 2 usuários
2. Buscar e iniciar conversa
3. Trocar mensagens
4. Verificar tempo real

### **Cenário 2: IA Assistant**
1. Configurar Groq
2. Abrir assistente IA
3. Testar diferentes modos
4. Enviar resposta para chat

### **Cenário 3: Administração**
1. Criar admin
2. Acessar painel
3. Gerenciar usuários
4. Ver estatísticas

### **Cenário 4: Segurança**
1. Tentar ataques básicos
2. Verificar rate limiting
3. Analisar logs
4. Testar bloqueios

## 🐛 Troubleshooting

### **Problemas Comuns**

#### **Erro Tailwind CSS (border-border)**
```bash
# Se aparecer erro: "The `border-border` class does not exist"
./fix-tailwind.sh

# Ou manualmente:
cd client
rm -rf node_modules/.vite
npm install
npm run dev
```

#### **MongoDB não conecta**
```bash
# Verificar se MongoDB está rodando
mongosh
# ou
docker run -d -p 27017:27017 mongo
```

#### **SMS não funciona**
- Normal em desenvolvimento
- SMS é simulado automaticamente
- Código sempre: `123456`

#### **IA não responde**
- Verificar API key no `.env`
- Testar conexão com provedor
- Ver logs do servidor

#### **Admin não acessa**
- Verificar se usuário tem `role: 'admin'`
- Recriar admin: `npm run create-admin`
- Limpar cache do navegador

### **Logs Úteis**
```bash
# Servidor
cd server && npm run dev

# Logs de segurança
tail -f server/logs/security.log

# Verificar configuração
node check-security.js
```

## 📚 Documentação Completa

- **README.md** - Visão geral do projeto
- **ADMIN_GUIDE.md** - Guia completo de administração
- **SECURITY.md** - Documentação de segurança
- **AI_INTEGRATION.md** - Integração com IA

## 🎉 Próximos Passos

Após testar o básico:

1. **Personalizar** - Alterar cores, logos, textos
2. **Configurar Produção** - HTTPS, domínio, SSL
3. **Integrar APIs** - Outros provedores de IA
4. **Expandir** - Grupos, arquivos, notificações
5. **Monitorar** - Logs, métricas, alertas

**🚀 Divirta-se explorando o WhatsClone!**
