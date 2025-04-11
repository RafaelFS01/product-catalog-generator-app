const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Backend operacional (Cloud Functions)' });
});

/**
 * Endpoint de upload de imagem usando Firebase Storage
 * Recebe o arquivo via multipart/form-data (campo 'productImage')
 * Salva no Storage e retorna a URL pública
 */
const multer = require('multer');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Inicializa o Firebase Admin SDK com chave de serviço e bucket do Storage
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'nome-do-projeto.appspot.com' // Substitua pelo nome real do seu bucket
});
const storage = admin.storage();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
});

app.post('/api/upload-image', upload.single('productImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo de imagem válido foi enviado.' });
    }
    const bucket = storage.bucket(); // Usa o bucket padrão do projeto
    const filename = `uploads/${Date.now()}-${uuidv4()}-${req.file.originalname}`;
    const file = bucket.file(filename);

    await file.save(req.file.buffer, {
      contentType: req.file.mimetype,
      public: true,
      metadata: {
        firebaseStorageDownloadTokens: uuidv4()
      }
    });

    // URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    res.status(200).json({ filePath: publicUrl });
  } catch (error) {
    console.error('Erro no upload para o Storage:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem.' });
  }
});

exports.api = functions.https.onRequest(app);