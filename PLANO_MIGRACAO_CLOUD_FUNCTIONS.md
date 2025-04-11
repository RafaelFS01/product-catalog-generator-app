# Plano Detalhado: Migração do Backend Express para Firebase Cloud Functions

## 1. Estrutura Recomendada de Pastas

```
/project-root
  /functions         # Novo diretório para o backend (Cloud Functions)
    index.js         # Ponto de entrada das funções
    /uploads         # (Opcional) Armazenamento temporário, prefira Cloud Storage
    package.json
  /public            # Frontend build (Vite/React)
  firebase.json
  .firebaserc
  ...
```

---

## 2. Instalar e Inicializar o Firebase Functions

- Instale as ferramentas:
  ```sh
  npm install -g firebase-tools
  ```
- Inicialize o projeto (caso ainda não tenha):
  ```sh
  firebase init
  ```
  - Escolha: **Functions** e **Hosting**
  - Linguagem: **JavaScript** ou **TypeScript**
  - Use um diretório `functions/` para o backend

---

## 3. Adaptar o Express para Cloud Functions

- No `functions/index.js`:
  ```js
  const functions = require('firebase-functions');
  const express = require('express');
  const app = express();

  // Importe e configure suas rotas normalmente
  // Exemplo:
  // const routes = require('./routes');
  // app.use('/api', routes);

  // Exporte como função HTTP
  exports.api = functions.https.onRequest(app);
  ```

- Mova suas rotas e middlewares do `backend/server.js` para dentro de `functions/`.

---

## 4. Configurar Proxy do Hosting para a Função

No `firebase.json`:
```json
{
  "hosting": {
    "public": "public",
    "rewrites": [
      { "source": "/api/**", "function": "api" },
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```
- Assim, qualquer chamada para `/api/*` será redirecionada para sua função Express.

---

## 5. Uploads de Arquivos

- **Cloud Functions não permite salvar arquivos localmente de forma persistente.**
- Para uploads, use o **Firebase Storage**:
  - Instale o SDK: `npm install firebase-admin`
  - No backend, faça upload dos arquivos para o Storage e salve a URL pública no banco de dados.

---

## 6. Variáveis de Ambiente

- Use `functions.config()` para variáveis sensíveis:
  ```sh
  firebase functions:config:set chave=valor
  ```
  - No código: `functions.config().chave`

---

## 7. Deploy e Testes Locais

- Para testar localmente:
  ```sh
  firebase emulators:start
  ```
- Para deploy:
  ```sh
  firebase deploy --only functions,hosting
  ```

---

## 8. Diagrama do Fluxo

```mermaid
flowchart TD
    A[Usuário] -->|Acessa| B[Firebase Hosting (Frontend)]
    B -->|/api/*| C[Cloud Function (Express backend)]
    C -->|Upload| D[Firebase Storage]
```

---

## 9. Pontos de Atenção

- **Timeout:** Funções HTTP têm timeout de 1 min (padrão).
- **Armazenamento:** Sempre use Cloud Storage para arquivos.
- **Limitações:** Funções são stateless, não há persistência local.
- **CORS:** Se consumir a API de outro domínio, configure CORS no Express.

---

## 10. Referências

- [Documentação oficial](https://firebase.google.com/docs/functions/get-started)
- [Express + Cloud Functions](https://firebase.google.com/docs/functions/http-events#using_express_with_cloud_functions)

---

**Pronto! Com esse plano, você pode migrar seu backend para Cloud Functions e ter frontend e backend integrados no Firebase.**