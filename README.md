# Packed Web — Frontend PWA & Mobile-First

Aplicação cliente do **Packed**, um planejador inteligente e determinístico de bagagem que cruza previsão climática, normas de companhias aéreas, choque térmico, infraestrutura elétrica e atividades planejadas para montar o checklist ideal de viagem.

---

## Stack Tecnológica

- **Core:** React 19 + TypeScript + Vite 8
- **Estilização & UI:** Tailwind CSS v4 (paleta proprietária configurada em `src/index.css`) + **shadcn/ui** + `lucide-react` + `sonner`
- **Roteamento:** `react-router-dom` v7 com guardas de sessão (`ProtectedRoute` e `GuestRoute`)
- **PWA & Mobile:** `vite-plugin-pwa` (Service Worker + Cache) e `@capacitor/core` (Android / iOS)

---

## Arquitetura de Diretórios (`src/`)

```text
src/
├── @types/
│   └── api.ts                  # Contratos e interfaces TypeScript espelhando a packed-api
├── assets/                     # Logos e imagens da marca
├── components/
│   ├── ui/                     # Primitivos de interface do shadcn/ui
│   └── layout/                 # Navegação global (Sidebar Desktop e BottomNav Mobile)
├── config/
│   └── env.ts                  # Variáveis de ambiente tipadas (VITE_API_URL)
├── layouts/
│   └── MainLayout.tsx          # Shell responsivo (Desktop + Mobile PWA + indicador offline)
├── lib/
│   └── utils.ts                # Utilitário cn()
├── modules/
│   ├── auth/pages/             # Splash, Login, Register, VerifyEmail, ForgotPassword, Profile
│   ├── trips/pages/            # TripsList (Dashboard) e NewTrip (Wizard Criação/Edição)
│   └── packing/pages/          # PackingList (Checklist interativo) e PackingInsights (Fatores)
├── platform/pwa/               # Hooks de conectividade (useNetworkStatus)
├── routes/                     # Árvore de rotas e guardas de autenticação
├── services/                   # Cliente HTTP com Refresh Token automático + serviços por domínio
└── store/
    └── AuthContext.tsx         # Estado global de sessão do viajante
```

---

## Configuração e Execução Local

1. **Instale as dependências:**
   ```bash
   pnpm install
   ```

2. **Configure as variáveis de ambiente:**
   Copie o arquivo `.env.example` para `.env` na raiz do `packed-web`:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```
   *(Certifique-se de que no `.env` do `packed-api` a variável `CORS_ORIGINS` inclua `http://localhost:5173`).*

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   pnpm run dev
   ```
   Acesse `http://localhost:5173`.

4. **Build de Produção e Lint:**
   ```bash
   pnpm run lint
   pnpm run build
   ```

---

## Adicionando Componentes do shadcn/ui

A resolução de aliases (`@/* -> ./src/*`) está configurada no `tsconfig.json` raiz e em `components.json`. Para instalar novos primitivos diretamente em `src/components/ui/`:

```bash
pnpm dlx shadcn@latest add <nome-do-componente>
```
> **Convenção:** Mantenha `src/components/ui/` exclusivo para primitivos do `shadcn` e crie componentes compostos de layout em `src/components/layout/`.
