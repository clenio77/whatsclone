# WhatsClone Client

Frontend do WhatsClone desenvolvido com React, TypeScript, Vite e Tailwind CSS.

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderno
- **Tailwind CSS** - Framework CSS utilitário
- **Zustand** - Gerenciamento de estado
- **React Router** - Roteamento
- **Socket.io Client** - Comunicação em tempo real
- **React Hook Form** - Formulários
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **React Hot Toast** - Notificações

## 📁 Estrutura

```
client/
├── public/              # Arquivos públicos
├── src/
│   ├── components/      # Componentes React
│   │   ├── auth/        # Componentes de autenticação
│   │   ├── chat/        # Componentes do chat
│   │   ├── common/      # Componentes reutilizáveis
│   │   └── contacts/    # Componentes de contatos
│   ├── pages/           # Páginas da aplicação
│   │   ├── Login/       # Página de login
│   │   ├── Chat/        # Página principal do chat
│   │   └── Profile/     # Página de perfil
│   ├── services/        # Serviços e stores
│   │   ├── api.ts       # Cliente API
│   │   ├── authStore.ts # Store de autenticação
│   │   ├── themeStore.ts# Store de tema
│   │   └── socketService.ts # Serviço Socket.io
│   ├── styles/          # Estilos globais
│   ├── utils/           # Utilitários
│   ├── App.tsx          # Componente principal
│   └── main.tsx         # Ponto de entrada
├── index.html           # HTML principal
├── vite.config.ts       # Configuração Vite
├── tailwind.config.js   # Configuração Tailwind
└── tsconfig.json        # Configuração TypeScript
```

## 🛠️ Instalação

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   ```bash
   # Criar arquivo .env.local
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

3. **Executar em desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acessar aplicação**:
   ```
   http://localhost:3000
   ```

## 🎨 Funcionalidades

### ✅ Implementadas
- **Autenticação completa**
  - Registro de usuário
  - Verificação por SMS
  - Login/logout
  - Persistência de sessão

- **Interface moderna**
  - Design responsivo
  - Tema claro/escuro
  - Componentes reutilizáveis
  - Animações suaves

- **Gerenciamento de estado**
  - Zustand para estado global
  - Persistência local
  - Sincronização automática

- **Navegação**
  - React Router
  - Rotas protegidas
  - Navegação fluida

### 🚧 Em desenvolvimento
- **Chat em tempo real**
  - Lista de conversas
  - Envio/recebimento de mensagens
  - Status de entrega/leitura
  - Indicadores de digitação

- **Funcionalidades avançadas**
  - Busca de usuários
  - Criação de grupos
  - Upload de arquivos
  - Notificações

## 🎯 Componentes Principais

### Páginas
- **LoginPage** - Autenticação completa
- **ChatPage** - Interface principal do chat
- **ProfilePage** - Configurações do usuário

### Componentes Comuns
- **Button** - Botão customizável
- **Input** - Campo de entrada
- **Avatar** - Avatar do usuário
- **LoadingSpinner** - Indicador de carregamento

### Stores (Zustand)
- **authStore** - Autenticação e usuário
- **themeStore** - Tema da aplicação

### Serviços
- **api** - Cliente HTTP com interceptors
- **socketService** - Comunicação em tempo real

## 🎨 Design System

### Cores
```css
/* WhatsApp Colors */
--whatsapp-light: #25D366
--whatsapp-dark: #128C7E
--whatsapp-darker: #075E54

/* Dark Mode */
--dark-bg: #0b141a
--dark-surface: #202c33
--dark-border: #2a3942
```

### Componentes CSS
- Classes utilitárias do Tailwind
- Componentes customizados
- Variantes responsivas
- Suporte a tema escuro

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com UI
npm run test:ui

# Coverage
npm run test:coverage
```

## 📱 Responsividade

- **Mobile First** - Design otimizado para mobile
- **Breakpoints** - Adaptação para tablet e desktop
- **Touch Friendly** - Elementos otimizados para toque

## 🔧 Build e Deploy

### Desenvolvimento
```bash
npm run dev
```

### Build de produção
```bash
npm run build
```

### Preview da build
```bash
npm run preview
```

### Análise do bundle
```bash
npm run build
npx vite-bundle-analyzer dist
```

## 🚀 Performance

### Otimizações implementadas
- **Code splitting** - Divisão automática do código
- **Lazy loading** - Carregamento sob demanda
- **Tree shaking** - Remoção de código não usado
- **Asset optimization** - Otimização de imagens e fontes

### Métricas alvo
- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Cumulative Layout Shift** < 0.1

## 📝 TODO

- [ ] Implementar chat em tempo real
- [ ] Adicionar busca de usuários
- [ ] Criar sistema de grupos
- [ ] Upload de arquivos/imagens
- [ ] Notificações push
- [ ] PWA completo
- [ ] Testes automatizados
- [ ] Storybook para componentes
