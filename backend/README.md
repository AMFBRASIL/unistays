# Unistays Backend

Backend robusto e seguro para o sistema PMS Unistays.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **TypeORM** - ORM para MySQL
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **Zod** - Validação de dados
- **Winston** - Logging
- **Helmet** - Segurança HTTP
- **Rate Limiting** - Proteção contra abuso

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (DB, env)
│   ├── controllers/     # Controladores (lógica de negócio)
│   ├── entities/        # Entidades TypeORM
│   ├── middlewares/     # Middlewares (auth, error, validation)
│   ├── routes/          # Rotas da API
│   ├── services/        # Serviços (lógica complexa)
│   ├── repositories/    # Repositórios (acesso a dados)
│   ├── utils/           # Utilitários (jwt, bcrypt, logger)
│   ├── validators/      # Validadores Zod
│   └── server.ts        # Entry point
├── database/
│   └── schema.sql       # Schema completo do MySQL
└── package.json
```

## 🔧 Instalação

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
# Editar .env com suas configurações
```

3. Criar banco de dados:
```sql
CREATE DATABASE unistays CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Executar schema SQL:
```bash
mysql -u root -p unistays < database/schema.sql
```

5. Executar migrations (se houver):
```bash
npm run migration:run
```

## 🏃 Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📊 Banco de Dados

O schema completo está em `database/schema.sql` e inclui:

- **Usuários e Permissões**
- **Propriedades e Unidades**
- **Hóspedes**
- **Reservas e Check-in/out**
- **Financeiro (Transações, Pagamentos)**
- **Tarifas e Planos**
- **CRM (Campanhas, Automações, Reviews)**
- **Integrações**
- **Estoque e Inventário**
- **Eventos**
- **Contratos Corporativos**
- **Programa de Fidelidade**
- **Auditoria e Logs**
- **Configurações e Templates**

## 🔐 Segurança

- ✅ JWT com refresh tokens
- ✅ Senhas hasheadas com bcrypt
- ✅ Rate limiting
- ✅ Helmet para headers de segurança
- ✅ CORS configurado
- ✅ Validação de dados com Zod
- ✅ Soft delete
- ✅ Auditoria de ações

## 📝 API Endpoints

### Autenticação
- `POST /api/v1/auth/register` - Registrar usuário
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Usuários
- `GET /api/v1/users/profile` - Perfil do usuário
- `PUT /api/v1/users/profile` - Atualizar perfil
- `GET /api/v1/users` - Listar usuários (admin/manager)
- `GET /api/v1/users/:id` - Detalhes do usuário
- `PUT /api/v1/users/:id` - Atualizar usuário (admin)
- `DELETE /api/v1/users/:id` - Deletar usuário (admin)

### Propriedades
- `GET /api/v1/properties` - Listar propriedades
- `GET /api/v1/properties/:id` - Detalhes da propriedade
- `POST /api/v1/properties` - Criar propriedade (admin/manager)
- `PUT /api/v1/properties/:id` - Atualizar propriedade
- `DELETE /api/v1/properties/:id` - Deletar propriedade (admin)

### Reservas
- `GET /api/v1/reservations` - Listar reservas
- `GET /api/v1/reservations/:id` - Detalhes da reserva
- `POST /api/v1/reservations` - Criar reserva
- `PUT /api/v1/reservations/:id` - Atualizar reserva
- `DELETE /api/v1/reservations/:id` - Deletar reserva
- `POST /api/v1/reservations/:id/check-in` - Check-in
- `POST /api/v1/reservations/:id/check-out` - Check-out

## 🔄 Próximos Passos

- [ ] Implementar refresh token completo
- [ ] Adicionar mais entidades (Guest, RatePlan, Transaction, etc.)
- [ ] Implementar serviços de negócio
- [ ] Adicionar testes unitários e de integração
- [ ] Implementar cache com Redis
- [ ] Adicionar documentação Swagger/OpenAPI
- [ ] Implementar filas para processamento assíncrono
- [ ] Adicionar suporte a upload de arquivos
