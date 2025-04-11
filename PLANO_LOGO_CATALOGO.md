# Plano para Correção da Exibição da Logo no Catálogo PDF

## Objetivo
Garantir que a logo da empresa seja exibida corretamente na capa do catálogo PDF, padronizando o tratamento do caminho da imagem no componente `PDFGenerator.tsx`.

---

## Passos de Implementação

1. **Identificar o trecho responsável pelo carregamento da logo no `PDFGenerator.tsx`:**
   - Localizar onde `catalogConfig.logoPath` é utilizado para criar o elemento `<img>`.

2. **Padronizar o caminho da logo:**
   - Antes de atribuir o valor ao `logoImg.src`, verificar se `logoPath` começa com `/uploads/`.
   - Se sim, concatenar o valor de `import.meta.env.VITE_BACKEND_URL` ao início do caminho.
   - Caso contrário, usar o valor de `logoPath` como está.

   ```ts
   // Exemplo de ajuste:
   logoImg.src = catalogConfig.logoPath.startsWith('/uploads/')
     ? (import.meta.env.VITE_BACKEND_URL || '') + catalogConfig.logoPath
     : catalogConfig.logoPath;
   ```

3. **Testar a geração do catálogo:**
   - Salvar uma nova logo nas configurações.
   - Gerar o catálogo PDF e verificar se a logo aparece corretamente na capa.

4. **(Opcional) Adicionar logs de depuração:**
   - Incluir logs para facilitar a identificação de eventuais problemas de carregamento da imagem.

---

## Diagrama do Fluxo

```mermaid
flowchart TD
    A[Usuário seleciona logo] --> B[Logo salva no backend]
    B --> C[logoPath salvo nas configurações]
    C --> D[PDFGenerator recebe logoPath]
    D --> E{logoPath começa com "/uploads/"?}
    E -- Sim --> F[Concatena VITE_BACKEND_URL + logoPath]
    E -- Não --> G[Usa logoPath como está]
    F & G --> H[Carrega imagem e renderiza no PDF]
```

---

## Observações

- O mesmo padrão já é utilizado para imagens dos produtos, garantindo consistência.
- Caso a logo não apareça mesmo após o ajuste, verificar se o arquivo está acessível publicamente e se não há bloqueio de CORS.

---

**Confirme se deseja que este plano seja implementado ou se deseja algum ajuste adicional.**