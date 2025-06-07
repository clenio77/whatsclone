const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// Armazenar conexões ativas
const activeConnections = new Map();

const initializeSocket = (io) => {
  // Middleware de autenticação para Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Token de autenticação requerido'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.isVerified) {
        return next(new Error('Token inválido'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`👤 Usuário conectado: ${socket.user.name} (${socket.userId})`);

    // Armazenar conexão
    activeConnections.set(socket.userId, socket.id);

    // Atualizar status online
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Entrar nas salas dos chats do usuário
    const userChats = await Chat.find({
      participants: socket.userId
    }).select('_id');

    userChats.forEach(chat => {
      socket.join(chat._id.toString());
    });

    // Notificar contatos sobre status online
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      isOnline: true
    });

    // Event: Entrar em um chat específico
    socket.on('join_chat', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (chat && chat.participants.includes(socket.userId)) {
          socket.join(chatId);
          console.log(`👤 ${socket.user.name} entrou no chat ${chatId}`);
        }
      } catch (error) {
        console.error('Erro ao entrar no chat:', error);
      }
    });

    // Event: Sair de um chat específico
    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
      console.log(`👤 ${socket.user.name} saiu do chat ${chatId}`);
    });

    // Event: Enviar mensagem
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type = 'text', replyTo } = data;

        // Verificar se o usuário faz parte do chat
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Acesso negado ao chat' });
          return;
        }

        // Criar mensagem
        const message = new Message({
          chat: chatId,
          sender: socket.userId,
          content,
          type,
          replyTo
        });

        await message.save();
        await message.populate('sender', 'name avatar');

        if (replyTo) {
          await message.populate('replyTo', 'content sender');
        }

        // Atualizar último atividade do chat
        chat.lastActivity = new Date();
        await chat.save();

        // Enviar mensagem para todos no chat
        io.to(chatId).emit('new_message', message);

        // Marcar como entregue para usuários online
        const onlineParticipants = chat.participants.filter(p =>
          p.toString() !== socket.userId && activeConnections.has(p.toString())
        );

        onlineParticipants.forEach(participantId => {
          message.markAsDelivered(participantId);
        });

        if (onlineParticipants.length > 0) {
          await message.save();
        }

        console.log(`💬 Mensagem enviada no chat ${chatId} por ${socket.user.name}`);
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        socket.emit('error', { message: 'Erro ao enviar mensagem' });
      }
    });

    // Event: Marcar mensagem como lida
    socket.on('mark_as_read', async (data) => {
      try {
        const { messageId, chatId } = data;

        const message = await Message.findById(messageId);
        if (message && message.sender.toString() !== socket.userId) {
          message.markAsRead(socket.userId);
          await message.save();

          // Notificar o remetente
          const senderSocketId = activeConnections.get(message.sender.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('message_read', {
              messageId,
              readBy: socket.userId,
              readAt: new Date()
            });
          }
        }
      } catch (error) {
        console.error('Erro ao marcar como lida:', error);
      }
    });

    // Event: Indicador de digitação
    socket.on('typing_start', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        isTyping: false
      });
    });

    // Event: Desconexão
    socket.on('disconnect', async () => {
      console.log(`👤 Usuário desconectado: ${socket.user.name} (${socket.userId})`);

      // Remover conexão ativa
      activeConnections.delete(socket.userId);

      // Atualizar status offline
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Notificar contatos sobre status offline
      socket.broadcast.emit('user_online', {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date()
      });
    });

    // Event: Erro
    socket.on('error', (error) => {
      console.error('Erro no socket:', error);
    });
  });

  return io;
};

// Função para obter usuários online
const getOnlineUsers = () => {
  return Array.from(activeConnections.keys());
};

// Função para verificar se usuário está online
const isUserOnline = (userId) => {
  return activeConnections.has(userId);
};

// Função para enviar notificação para usuário específico
const sendNotificationToUser = (userId, event, data) => {
  const socketId = activeConnections.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

module.exports = {
  initializeSocket,
  getOnlineUsers,
  isUserOnline,
  sendNotificationToUser
};