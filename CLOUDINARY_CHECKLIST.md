# ✅ Cloudinary Production Deployment Checklist

Este é o checklist para resolver o problema do Cloudinary em produção no Vercel.

**Situação Atual:**
- ❌ Upload de fotos não funcionando em produção (Vercel)
- ✅ Upload funcionando localmente
- ✅ API logic está correta
- ❌ Environment variables não chegando no Vercel

---

## PARTE 1: Diagnóstico Local

- [ ] Rode o script de verificação: `node verify-cloudinary.js`
- [ ] Confirme que o output mostra: ✓ CLOUDINARY_CLOUD_NAME, ✓ CLOUDINARY_API_KEY, ✓ CLOUDINARY_API_SECRET
- [ ] Se não funcionar, copie `.env.example` para `.env` e preencha com seus valores do Cloudinary

---

## PARTE 2: Verificação no Vercel (CRÍTICO!)

- [ ] Acesse https://vercel.com/dashboard
- [ ] Clique em seu projeto (`site`)
- [ ] Vá para **Settings > Environment Variables**
- [ ] Procure por estas 3 variáveis:
  - [ ] `CLOUDINARY_CLOUD_NAME` existe?
  - [ ] `CLOUDINARY_API_KEY` existe?
  - [ ] `CLOUDINARY_API_SECRET` existe?
- [ ] Certifique-se de que estão no ambiente **Production** (não Preview)
- [ ] Clique em cada uma e confirme que o valor não está vazio
- [ ] Se qualquer uma estiver faltando, **adicione agora**
- [ ] Se alguma estiver vazia, **atualize com o valor correto**

---

## PARTE 3: Redeploy no Vercel

- [ ] Acesse https://vercel.com/dashboard/deployments
- [ ] Clique no último deployment (em cima)
- [ ] Clique no botão "Redeploy" (no menu superior direito)
- [ ] Aguarde o deployment terminar (verde e diz "Ready")

---

## PARTE 4: Teste de Diagnóstico em Produção

**Importante:** Aguarde 2-3 minutos após o redeploy antes de testar!

- [ ] Acesse: `https://seu-projeto.vercel.app/api/cloudinary-env`
  - Substitua `seu-projeto` pelo nome real do seu projeto
  - Exemplo: `https://bnb-qzww5bq3x-carlos-projects-55cb1273.vercel.app/api/cloudinary-env`

- [ ] Verifique o JSON retornado:
  ```json
  {
    "CLOUDINARY_CLOUD_NAME": "deu valor aqui?",
    "CLOUDINARY_API_KEY": "EXISTS ou MISSING?",
    "CLOUDINARY_API_SECRET": "EXISTS ou MISSING?",
    ...
  }
  ```

**Resultado esperado:**
- `CLOUDINARY_CLOUD_NAME`: Seu cloud name (ex: "duycpzep8")
- `CLOUDINARY_API_KEY`: "EXISTS" (não "MISSING")
- `CLOUDINARY_API_SECRET`: "EXISTS" (não "MISSING")

**Se vê "MISSING":**
- ❌ Volte para PARTE 2 e confirme que as variáveis estão configuradas
- ❌ Tente adicionar novamente (variáveis antigas podem estar em cache)
- ❌ Remova as variáveis, aguarde 5 min, adicione novamente

---

## PARTE 5: Teste de Upload

Se o Passo 4 funcionou (não vê mais "MISSING"):

- [ ] Acesse seu site: `https://seu-projeto.vercel.app/login`
- [ ] Faça login com credenciais de admin
- [ ] Vá para protected area (Dashboard/Admin)
- [ ] Tente criar ou editar uma sala com upload de foto
- [ ] Se funcionar: ✅ **Problema resolvido!**
- [ ] Se ainda falhar: Verifique logs (próximo passo)

---

## PARTE 6: Se Ainda Não Funcionar - Verificar Logs

- [ ] Acesse: https://vercel.com/dashboard/deployments
- [ ] Clique no último deployment
- [ ] Clique em "View Logs"
- [ ] Procure por linhas com:
  - `=== POST /api/rooms - Iniciando ===`
  - `getCloudinaryConfig() - Valores brutos:`
  - `CLOUDINARY_CLOUD_NAME =`
  - `Cloudinary Config Status:`

- [ ] Screenshot dos logs e compartilhe

---

## PARTE 7: Segurança - Revogar Credenciais Antigas

**IMPORTANTE:** A API Key `324379719164739` foi exposta no Git e deve ser revogada!

- [ ] Acesse: https://cloudinary.com/console/settings/api-keys
- [ ] Procure pela chave: `324379719164739`
- [ ] Clique em "Revoke" ou "Delete"
- [ ] Aguarde confirmação
- [ ] Gere uma **NOVA** API Key
- [ ] Copie a nova chave
- [ ] Atualize no Vercel:
  - [ ] `CLOUDINARY_API_KEY` (nova chave)
  - [ ] `CLOUDINARY_API_SECRET` (novo secret)
- [ ] Redeploy no Vercel

---

## PARTE 8: Teste Final

- [ ] Teste upload novamente
- [ ] Confirme que as fotos aparecem nas galerias
- [ ] Verifique que as URLs das fotos começam com `https://res.cloudinary.com/`

---

## Referência Rápida

| Problema | Solução |
|----------|---------|
| `/api/cloudinary-env` mostra "MISSING" | Adicionar variáveis no Vercel Environment Variables |
| Upload continua falhando após redeploy | Verificar logs do Vercel e compartilhar |
| Variáveis configuradas mas ainda "MISSING" | Remover, aguardar 5 min, adicionar novamente |
| Precisa gerar novo API Key | Ir em Cloudinary Console > Settings > API Keys |
| Produto já foi deployado com sucesso? | Fazer teste em: `/api/cloudinary-env` |

---

## Comandos Úteis (Local)

```bash
# Verificar configuração local
node verify-cloudinary.js

# Rodar servidor local
npm run dev

# Rebuildar projeto (se necessário)
npm run build

# Limpar cache Next.js
rm -rf .next

# Restartar servidor limpo
npm run dev -- --no-cache
```

---

**Status:** ⏳ Aguardando execução dos passos acima

Após completar os passos, o ambiente variables deve aparecer corretamente na produção e os uploads funcionarão.
