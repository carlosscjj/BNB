# Sistema de Gerenciamento de Hospedagem (BnB Management)

This is a [Next.js](https://nextjs.org) project for managing booking properties with photo uploads.

## Quick Start

### 1. Setup Inicial

```bash
# Instalar dependências
npm install

# Copiar arquivo de variáveis de ambiente
cp .env.example .env

# Configurar as variáveis no .env:
# - DATABASE_URL (PostgreSQL via Neon)
# - NEXTAUTH_SECRET (gerar uma senha aleatória)
# - NEXTAUTH_URL (http://localhost:3000 para desenvolvimento)
# - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

### 2. Setup do Banco de Dados

```bash
# Migrar schema do Prisma
npx prisma migrate dev

# (Opcional) Popular o banco com dados de teste
npx prisma db seed
```

### 3. Verificar Cloudinary

```bash
# Testar configuração do Cloudinary
node verify-cloudinary.js
```

### 4. Rodar o Servidor

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## Cloudinary Configuration (Important!)

Photo uploads funcionam via Cloudinary. Para habilitar:

### Local Development

1. Crie uma conta em [cloudinary.com](https://cloudinary.com)
2. Obtenha suas credenciais em: https://cloudinary.com/console/settings/api-keys
3. Configure `.env` com suas credenciais:
   ```
   CLOUDINARY_CLOUD_NAME="seu-cloud-name"
   CLOUDINARY_API_KEY="sua-api-key"
   CLOUDINARY_API_SECRET="seu-api-secret"
   ```
4. Teste com: `node verify-cloudinary.js`

### Production (Vercel)

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá para seu projeto > Settings > Environment Variables
3. Adicione as 3 variáveis acima com valor "Production"
4. Faça redeploy
5. Teste em: `https://seu-projeto.vercel.app/api/cloudinary-env`

### Troubleshooting

Se tiver problemas, veja [CLOUDINARY_DEBUG.md](./CLOUDINARY_DEBUG.md) para um guia detalhado.

---

## Funcionalidades

- ✅ Autenticação com NextAuth (Credenciais)
- ✅ Gerenciamento de usuários (Admin/Staff)
- ✅ CRUD de salas com upload de fotos
- ✅ Agenda/Calendário (FullCalendar)
- ✅ Dashboard com gráficos de ganhos e reservas
- ✅ Histórico de comentários por sala

---

## Estrutura do Projeto

```
app/
  ├── (protected)/        # Rotas que requerem autenticação
  │   ├── admin/         # Painel administrativo
  │   ├── dashboard/     # Dashboard com gráficos
  │   ├── calendar/      # Calendar/Agenda
  │   ├── rooms/         # Gerenciamento de salas
  │   └── reservations/  # Gerenciamento de reservas
  ├── api/               # API routes NextAuth e CRUD
  └── login/             # Página de login pública
components/             # Componentes React reutilizáveis
lib/                    # Utilitários (auth, translations, etc)
prisma/                 # Schema e migrations do banco
public/                 # Assets estáticos
```

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma ORM](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org)
- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_widget)
- [FullCalendar](https://fullcalendar.io/docs/react)

---

## Deploy on Vercel

```bash
npm run build
git push  # Vercel detecta automaticamente
```

Mais detalhes: [Vercel Deploy Docs](https://vercel.com/docs/frameworks/nextjs)
