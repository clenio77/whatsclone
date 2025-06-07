const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;
const sharp = require('sharp');
const securityLogger = require('../services/securityLogger');

// Configurações de segurança para upload
const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedFileTypes: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxFiles: 5,
  uploadDir: path.join(__dirname, '../uploads'),
  tempDir: path.join(__dirname, '../temp')
};

// Assinaturas de arquivo para validação
const FILE_SIGNATURES = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF],
    [0xFF, 0xD8, 0xFF, 0xE0],
    [0xFF, 0xD8, 0xFF, 0xE1]
  ],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]
  ],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]]
};

// Criar diretórios necessários
const initUploadDirs = async () => {
  try {
    await fs.mkdir(UPLOAD_CONFIG.uploadDir, { recursive: true });
    await fs.mkdir(UPLOAD_CONFIG.tempDir, { recursive: true });
    await fs.mkdir(path.join(UPLOAD_CONFIG.uploadDir, 'avatars'), { recursive: true });
    await fs.mkdir(path.join(UPLOAD_CONFIG.uploadDir, 'messages'), { recursive: true });
  } catch (error) {
    console.error('Erro ao criar diretórios de upload:', error);
  }
};

initUploadDirs();

// Validar assinatura do arquivo
const validateFileSignature = async (filePath, mimeType) => {
  try {
    const signatures = FILE_SIGNATURES[mimeType];
    if (!signatures) return true; // Tipo não verificado

    const buffer = await fs.readFile(filePath);
    const fileHeader = Array.from(buffer.slice(0, 16));

    return signatures.some(signature => 
      signature.every((byte, index) => fileHeader[index] === byte)
    );
  } catch (error) {
    return false;
  }
};

// Escanear arquivo em busca de conteúdo malicioso
const scanFileContent = async (filePath, mimeType) => {
  try {
    // Padrões suspeitos
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /eval\s*\(/gi,
      /document\.write/gi
    ];

    if (mimeType.startsWith('text/') || mimeType === 'application/pdf') {
      const content = await fs.readFile(filePath, 'utf8');
      
      for (const pattern of maliciousPatterns) {
        if (pattern.test(content)) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    return false;
  }
};

// Configuração do multer com validações de segurança
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.params.type || 'messages';
    const destDir = path.join(UPLOAD_CONFIG.uploadDir, uploadType);
    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único e seguro
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${uniqueSuffix}${ext}`;
    cb(null, safeName);
  }
});

// Filtro de arquivos com validações rigorosas
const fileFilter = async (req, file, cb) => {
  try {
    // Verificar tipo MIME
    const allowedTypes = [
      ...UPLOAD_CONFIG.allowedImageTypes,
      ...UPLOAD_CONFIG.allowedFileTypes
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      securityLogger.logSecurityEvent('UPLOAD_INVALID_TYPE', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?._id,
        filename: file.originalname,
        mimetype: file.mimetype
      });

      return cb(new Error('Tipo de arquivo não permitido'), false);
    }

    // Verificar extensão
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.doc', '.docx'];
    
    if (!allowedExtensions.includes(ext)) {
      securityLogger.logSecurityEvent('UPLOAD_INVALID_EXTENSION', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?._id,
        filename: file.originalname,
        extension: ext
      });

      return cb(new Error('Extensão de arquivo não permitida'), false);
    }

    // Verificar nome do arquivo
    const filename = path.basename(file.originalname, ext);
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      securityLogger.logSecurityEvent('UPLOAD_INVALID_FILENAME', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?._id,
        filename: file.originalname
      });

      return cb(new Error('Nome de arquivo contém caracteres inválidos'), false);
    }

    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

// Configuração do multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.maxFileSize,
    files: UPLOAD_CONFIG.maxFiles,
    fieldNameSize: 100,
    fieldSize: 1024
  }
});

// Middleware de validação pós-upload
const validateUploadedFile = async (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const files = req.files || [req.file];

  try {
    for (const file of files) {
      // Validar assinatura do arquivo
      const isValidSignature = await validateFileSignature(file.path, file.mimetype);
      if (!isValidSignature) {
        await fs.unlink(file.path); // Remover arquivo inválido
        
        securityLogger.logSecurityEvent('UPLOAD_INVALID_SIGNATURE', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: req.user?._id,
          filename: file.originalname,
          mimetype: file.mimetype
        });

        return res.status(400).json({
          error: 'Arquivo corrompido ou tipo inválido'
        });
      }

      // Escanear conteúdo malicioso
      const isClean = await scanFileContent(file.path, file.mimetype);
      if (!isClean) {
        await fs.unlink(file.path); // Remover arquivo malicioso
        
        securityLogger.logSecurityEvent('UPLOAD_MALICIOUS_CONTENT', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: req.user?._id,
          filename: file.originalname
        });

        return res.status(400).json({
          error: 'Conteúdo suspeito detectado no arquivo'
        });
      }

      // Processar imagens (redimensionar e otimizar)
      if (file.mimetype.startsWith('image/')) {
        await processImage(file);
      }

      // Log de upload bem-sucedido
      securityLogger.logSecurityEvent('UPLOAD_SUCCESS', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?._id,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      });
    }

    next();
  } catch (error) {
    console.error('Erro na validação de upload:', error);
    
    // Limpar arquivos em caso de erro
    for (const file of files) {
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.error('Erro ao remover arquivo:', unlinkError);
      }
    }

    res.status(500).json({
      error: 'Erro no processamento do arquivo'
    });
  }
};

// Processar imagens (redimensionar e otimizar)
const processImage = async (file) => {
  try {
    const image = sharp(file.path);
    const metadata = await image.metadata();

    // Redimensionar se muito grande
    if (metadata.width > 1920 || metadata.height > 1920) {
      await image
        .resize(1920, 1920, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(file.path + '.processed');

      // Substituir arquivo original
      await fs.rename(file.path + '.processed', file.path);
    }

    // Remover metadados EXIF por segurança
    await image
      .rotate() // Auto-rotate baseado em EXIF
      .jpeg({ quality: 90 })
      .toFile(file.path + '.clean');

    await fs.rename(file.path + '.clean', file.path);
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    // Continuar mesmo com erro de processamento
  }
};

// Middleware para limpeza de arquivos temporários
const cleanupTempFiles = async (req, res, next) => {
  // Executar após resposta
  res.on('finish', async () => {
    if (req.tempFiles) {
      for (const tempFile of req.tempFiles) {
        try {
          await fs.unlink(tempFile);
        } catch (error) {
          console.error('Erro ao limpar arquivo temporário:', error);
        }
      }
    }
  });

  next();
};

module.exports = {
  upload,
  validateUploadedFile,
  cleanupTempFiles,
  UPLOAD_CONFIG
};
