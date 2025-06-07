const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  console.error('❌ Erro:', err);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // Erro de cast do Mongoose (ID inválido)
  if (err.name === 'CastError') {
    const message = 'Recurso não encontrado';
    error = {
      message,
      statusCode: 404
    };
  }

  // Erro de duplicação (código 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} já está em uso`;
    error = {
      message,
      statusCode: 400
    };
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = {
      message,
      statusCode: 401
    };
  }

  // Erro de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = {
      message,
      statusCode: 401
    };
  }

  // Erro de arquivo muito grande
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Arquivo muito grande';
    error = {
      message,
      statusCode: 400
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
