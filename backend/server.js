// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

// --- Configuração de CORS ---
app.use(cors({ origin: FRONTEND_ORIGIN }));
console.log(`CORS habilitado para: ${FRONTEND_ORIGIN}`);

// --- Configuração da Pasta de Uploads ---
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
console.log(`Verificando/criando pasta de uploads em: ${UPLOADS_DIR}`);
if (!fs.existsSync(UPLOADS_DIR)) {
    try {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        console.log('Pasta de uploads criada com sucesso.');
    } catch (err) {
        console.error('ERRO FATAL: Não foi possível criar a pasta de uploads:', err);
        process.exit(1); // Aborta se não conseguir criar a pasta
    }
} else {
    console.log('Pasta de uploads encontrada.');
}

// --- Configuração do Multer ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR); // Onde salvar
    },
    filename: (req, file, cb) => {
        // Nome único: fieldname-timestamp-random.extensao
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Aceita imagem
    } else {
        cb(new Error('Apenas arquivos de imagem são permitidos!'), false); // Rejeita
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
    fileFilter: fileFilter
});

// --- Endpoint de Upload ---
// A chave 'productImage' DEVE corresponder à chave usada no FormData do frontend
app.post('/api/upload-image', upload.single('productImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo de imagem válido foi enviado.' });
    }
    // Retorna o CAMINHO RELATIVO PÚBLICO para o frontend
    const publicPath = `/uploads/${req.file.filename}`;
    console.log(`Upload bem-sucedido: ${req.file.filename}. Caminho público: ${publicPath}`);
    res.status(200).json({ filePath: publicPath });

}, (error, req, res, next) => { // Tratamento de erros do Multer e outros
    console.error("Erro durante o upload:", error.message);
    if (error instanceof multer.MulterError) {
        return res.status(400).json({ error: `Erro Multer: ${error.message}` });
    } else if (error) {
        return res.status(400).json({ error: error.message });
    }
    next();
});

// --- Servir Arquivos Estáticos ---
// Disponibiliza a pasta 'public' (que contém 'uploads') via HTTP
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir, {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));
console.log(`Servindo arquivos estáticos de: ${publicDir}`);

// --- Rota de Verificação (Health Check) ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Backend operacional' });
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
    console.log(`Backend Node.js rodando em http://localhost:${PORT}`);
});
