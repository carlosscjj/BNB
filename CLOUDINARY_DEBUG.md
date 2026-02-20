# Debugging Cloudinary Configuration

## Passo 1: Verificar Endpoint de Diagnóstico

Acesse este URL no seu navegador para ver o status das variáveis de ambiente:

- **Local**: `http://localhost:3000/api/cloudinary-env`
- **Produção**: `https://seu-projeto.vercel.app/api/cloudinary-env`

**Resultado esperado:**
```json
{
  "CLOUDINARY_CLOUD_NAME": "duycpzep8",
  "CLOUDINARY_API_KEY": "EXISTS",
  "CLOUDINARY_API_SECRET": "EXISTS",
  "CLOUDINARY_URL": "MISSING",
  "NODE_ENV": "production",
  "VERCEL_ENV": "production"
}
```

**Se você vê "MISSING"**, continue para o Passo 2.

---

## Passo 2: Verificar Configuração no Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique no seu projeto: `site`
3. Vá para **Settings** > **Environment Variables**
4. Procure por estas 3 variáveis (deve estar na aba **Production**):
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

**Checklist:**
- [ ] As 3 variáveis estão listadas?
- [ ] Estão na aba "Production"?
- [ ] Não há espaços em branco antes/depois dos valores?
- [ ] Os valores não estão vazios?

Se algum estiver faltando ou vazio, adicione/corrija agora.

---

## Passo 3: Redeployed do Vercel

Após adicionar/corrigir as variáveis:

1. Acesse [Deployments](https://vercel.com/dashboard/deployments)
2. Clique no último deployment
3. Clique em "Redeploy" (no menu superior)
4. Aguarde o deployment terminar

Depois de 2-3 minutos, teste novamente a URL `/api/cloudinary-env` em produção.

---

## Passo 4: Teste de Upload

Se o Passo 3 funcionou e as variáveis agora aparecem:

1. Acesse a área protegida do seu site (login necessário)
2. Vá para **Admin > Cadastrar Novo Usuário** (ou a página de upload de sala)
3. Tente fazer upload de uma foto
4. Verifique se funciona

Se ainda não funcionar, verifique os logs do Vercel:

1. Vá para [Vercel Dashboard > Deployments](https://vercel.com/dashboard/deployments)
2. Clique no último deployment
3. Clique em "View Logs"
4. Procure por mensagens com "Cloudinary" ou "ENV DEBUG"
5. Compartilhe o conteúdo dos logs aqui

---

## Passo 5: Se Ainda Não Funcionar (Soluções Alternativas)

### Opção A: Verificar Variáveis Antigas
Se você configurou essas variáveis há muito tempo, elas podem estar em cache:

1. Remova as 3 variáveis do Vercel
2. Aguarde 5 minutos
3. Adicione-as novamente
4. Redeploye

### Opção B: Usar CLOUDINARY_URL

Se as variáveis individuais continuarem não funcionando, use uma variável consolidada:

1. Vá para [Cloudinary Console > Settings](https://cloudinary.com/console/settings)
2. Procure por "API Environment Variable"
3. Copie o valor que começa com `cloudinary://`
4. No Vercel, crie uma nova variável:
   - Nome: `CLOUDINARY_URL`
   - Valor: (cole o valor do passo anterior)
   - Ambiente: Production
5. Remova as outras 3 variáveis
6. Redeploye

---

## Informações sobre sua Conta Cloudinary

- **Cloud Name**: `duycpzep8`
- **Antiga API Key Exposta**: `324379719164739` (REVOGUE ESTA IMEDIATAMENTE!)
- **Nova API Key**: Configure uma nova em [Cloudinary Console](https://cloudinary.com/console)

### TODO: Revogue a API Key Antiga
1. Acesse [Cloudinary Console > Settings > API Keys](https://cloudinary.com/console/settings/api-keys)
2. Procure pela chave `324379719164739`
3. Clique em "Revoke" ou "Delete"
4. Gere uma nova API Key
5. Atualize as variáveis no Vercel com a nova chave

---

## Log de Erros no Servidor

Quando você tenta fazer upload e recebe erro no Cloudinary, vá para **Vercel > Deployments > [seu deployment] > View Logs** e procure por:

```
=== POST /api/rooms - Iniciando ===
getCloudinaryConfig() - Valores brutos:
  CLOUDINARY_CLOUD_NAME = "..."
  CLOUDINARY_API_KEY = "..."
  CLOUDINARY_API_SECRET = "..."
Cloudinary Config Status:
  cloud_name: ✓ ou ✗
  api_key: ✓ ou ✗
  api_secret: ✓ ou ✗
```

Se aparecer `✗`, a variável não estará chegando no Vercel.

---

## Próximas Ações

1. [ ] Verificar `/api/cloudinary-env` em produção
2. [ ] Confirmar variáveis no Vercel Settings
3. [ ] Fazer redeploy no Vercel
4. [ ] Testar upload novamente
5. [ ] Se falhar, compartilhar logs do Vercel
6. [ ] Revogar API Key antiga na Cloudinary
7. [ ] Gerar e configurar nova API Key
