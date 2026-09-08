# 🔐 Sistema de Autenticação - Unistays

## ✅ Implementado

### Frontend
- ✅ Página de autenticação (`/login`) com login e registro
- ✅ Contexto de autenticação (`AuthContext`)
- ✅ Cliente API (`lib/api.ts`)
- ✅ Proteção de rotas (`ProtectedRoute`)
- ✅ Header com menu do usuário e logout
- ✅ Armazenamento de token no localStorage
- ✅ Redirecionamento automático após login

### Backend
- ✅ Endpoint de login (`POST /api/v1/auth/login`)
- ✅ Endpoint de registro (`POST /api/v1/auth/register`)
- ✅ JWT com tokens de acesso e refresh
- ✅ Validação de dados com Zod
- ✅ Hash de senhas com bcrypt

## 🚀 Como Usar

### 1. Iniciar Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Iniciar Frontend
```bash
# Na raiz do projeto
npm install
npm run dev
```

### 3. Acessar
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`
- Login: `http://localhost:8080/login`

### 4. Credenciais iniciais
Após executar o seed do backend (`npm run seed`), use as credenciais configuradas localmente e **troque as senhas** antes de expor o ambiente.

## 📋 Fluxo de Autenticação

1. Usuário acessa `/login`
2. Preenche email e senha
3. Frontend chama `POST /api/v1/auth/login`
4. Backend valida credenciais no banco
5. Backend retorna JWT token
6. Frontend salva token no localStorage
7. Usuário é redirecionado para `/` (dashboard)
8. Rotas protegidas verificam token automaticamente

## 🔒 Segurança

- ✅ Tokens JWT com expiração
- ✅ Senhas hasheadas (bcrypt)
- ✅ Validação de dados no frontend e backend
- ✅ Proteção de rotas
- ✅ Headers de segurança (Helmet)
- ✅ CORS configurado

## 📝 Estrutura de Arquivos

```
src/
├── contexts/
│   └── AuthContext.tsx      # Contexto de autenticação
├── components/
│   ├── ProtectedRoute.tsx   # Componente de proteção de rotas
│   └── layout/
│       └── Header.tsx        # Header com menu do usuário
├── lib/
│   └── api.ts               # Cliente API
└── pages/
    └── Auth.tsx              # Página de login/registro
```

## 🐛 Troubleshooting

### Erro: "Erro de conexão com o servidor"
- Verifique se o backend está rodando em `http://localhost:3000`
- Verifique o CORS no backend

### Erro: "Credenciais inválidas"
- Verifique se o usuário existe no banco
- Execute o seed: `cd backend && npm run seed`

### Token não persiste
- Verifique se o localStorage está habilitado no navegador
- Limpe o cache e tente novamente
