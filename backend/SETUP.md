# 🚀 Guia de Configuração - Backend Unistays

## Pré-requisitos

- Node.js 18+ instalado
- MySQL 8.0+ instalado e rodando
- npm ou yarn

## Passo a Passo

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Banco de Dados

#### Criar o banco de dados:

```sql
CREATE DATABASE unistays CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Executar o schema SQL:

```bash
# Windows (PowerShell)
mysql -u root -p unistays < database\schema.sql

# Linux/Mac
mysql -u root -p unistays < database/schema.sql
```

Ou execute o arquivo `database/schema.sql` diretamente no MySQL Workbench ou cliente MySQL.

### 3. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure:

```bash
# Windows
copy env.example .env

# Linux/Mac
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=sua_senha_aqui
DB_DATABASE=unistays

# JWT (IMPORTANTE: Altere em produção!)
JWT_SECRET=seu-secret-key-super-seguro-aqui
JWT_REFRESH_SECRET=seu-refresh-secret-key-aqui
```

### 4. Criar Diretórios Necessários

```bash
# Windows
mkdir logs
mkdir uploads

# Linux/Mac
mkdir -p logs uploads
```

### 5. Executar Seeds (Dados Iniciais)

```bash
npm run seed
```

Isso criará:
- Usuário admin: `admin@unistays.com` / `admin123`
- Usuário gerente: `gerente@unistays.com` / `gerente123`

### 6. Iniciar o Servidor

#### Desenvolvimento:
```bash
npm run dev
```

#### Produção:
```bash
npm run build
npm start
```

O servidor estará rodando em: `http://localhost:3000`

## 📋 Verificação

### Health Check
```bash
curl http://localhost:3000/health
```

### Testar Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@unistays.com",
    "password": "admin123"
  }'
```

## 🔐 Segurança em Produção

⚠️ **IMPORTANTE**: Antes de colocar em produção:

1. Altere todas as chaves JWT no `.env`
2. Configure `NODE_ENV=production`
3. Desabilite `DB_SYNCHRONIZE=true` (deixe `false`)
4. Configure CORS adequadamente
5. Use HTTPS
6. Configure firewall e rate limiting adequado
7. Faça backup regular do banco de dados

## 📚 Próximos Passos

- [ ] Configurar integrações (Channel Managers, Payment Gateways)
- [ ] Implementar mais endpoints
- [ ] Adicionar testes
- [ ] Configurar CI/CD
- [ ] Adicionar documentação Swagger
