# Passo a Passo: Ativação e Integração do Firebase Storage

## 1. Ativar o Firebase Storage no Console

1. Acesse o [Console do Firebase](https://console.firebase.google.com/).
2. Selecione seu projeto.
3. No menu lateral, clique em **Storage**.
4. Clique em **Começar** e siga o assistente para criar o bucket padrão.
   - Escolha a localização (região) mais próxima dos seus usuários.
   - O bucket padrão terá um nome como `nome-do-projeto.appspot.com`.

---

## 2. Configurar Regras de Segurança

- Para testes, você pode liberar acesso público temporariamente:
  ```json
  service firebase.storage {
    match /b/{bucket}/o {
      match /{allPaths=**} {
        allow read, write: if true;
      }
    }
  }
  ```
- **Atenção:** Para produção, restrinja o acesso! Exemplo para apenas usuários autenticados:
  ```json
  service firebase.storage {
    match /b/{bucket}/o {
      match /{allPaths=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```
- Edite as regras em **Storage > Regras** no console.

---

## 3. Obter Credenciais para o Backend

1. No console do Firebase, vá em **Configurações do Projeto > Contas de Serviço**.
2. Clique em **Gerar nova chave privada** e baixe o arquivo JSON.
3. Salve esse arquivo na raiz do seu projeto (ex: `functions/serviceAccountKey.json`).
4. No `functions/index.js`, inicialize o admin SDK assim:
   ```js
   const admin = require('firebase-admin');
   const serviceAccount = require('./serviceAccountKey.json');
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
     storageBucket: 'nome-do-projeto.appspot.com'
   });
   ```

---

## 4. Testar o Upload

- Faça deploy das funções:
  ```sh
  firebase deploy --only functions
  ```
- Use o frontend ou uma ferramenta como Postman para enviar um arquivo para `/api/upload-image`.
- Verifique no console do Firebase se o arquivo aparece no Storage.

---

## 5. Ajustar o Frontend

- Use a URL pública retornada pelo backend para exibir imagens.
- Exemplo de URL: `https://storage.googleapis.com/nome-do-projeto.appspot.com/uploads/arquivo.jpg`

---

## 6. Recomendações

- **Nunca** deixe as regras públicas em produção.
- Monitore o uso do Storage pelo console.
- Considere usar autenticação para uploads sensíveis.
- Para remover arquivos, use o SDK do admin no backend.

---

**Pronto! Com esses passos, seu sistema estará integrado ao Firebase Storage de forma segura e escalável.**