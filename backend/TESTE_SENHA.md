# Teste de Criação de Hóspede com Senha

## 📋 Checklist de Verificação

### 1. ✅ Verificar se o campo existe no banco
```sql
DESCRIBE guests;
-- Deve mostrar: password | varchar(255) | YES
```

### 2. ✅ Verificar logs do backend

Ao criar/editar um hóspede, você deve ver no console do backend:

**Criação COM senha:**
```
[GuestController.create] Hashing password for guest: email@exemplo.com
[GuestController.create] Password hashed successfully
```

**Criação SEM senha:**
```
[GuestController.create] No password provided for guest: email@exemplo.com
```

**Edição COM senha:**
```
[GuestController.update] Hashing password for guest ID: 123
[GuestController.update] Password hashed successfully
```

**Edição SEM senha:**
```
[GuestController.update] No password update for guest ID: 123
```

### 3. ✅ Verificar payload do frontend

Abra o DevTools (F12) → Network → Crie um hóspede → Veja a requisição POST/PUT

**Payload deve conter:**
```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@exemplo.com",
  "password": "senha123",  // ← DEVE ESTAR PRESENTE
  ...
}
```

### 4. ✅ Verificar no banco de dados

Após criar um hóspede com senha:

```sql
SELECT id, first_name, last_name, email, password 
FROM guests 
WHERE email = 'email@teste.com';
```

**Resultado esperado:**
- `password` deve ter um hash bcrypt (começa com `$2b$10$`)
- Exemplo: `$2b$10$abcdefghijklmnopqrstuvwxyz1234567890`

### 5. ✅ Testar login

Após criar hóspede com senha, teste o login:

```bash
# Via curl (Windows PowerShell)
$body = @{
    email = "joao@exemplo.com"
    password = "senha123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/guests/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "guest": {
      "id": 123,
      "name": "João Silva",
      "email": "joao@exemplo.com"
    }
  }
}
```

---

## 🐛 Problemas Comuns

### Problema 1: Senha não aparece no payload
**Sintoma:** No Network do DevTools, o campo `password` não está presente

**Solução:**
1. Verifique se você preencheu o campo de senha no formulário
2. Verifique se o modo está em "Manual" ou "Automática"
3. Verifique se `formData.password` tem valor antes do submit

### Problema 2: Senha é enviada mas não é salva
**Sintoma:** Logs mostram "No password provided"

**Possíveis causas:**
- Campo `password` está como string vazia `""`
- Campo `password` está como `undefined`
- Validador está rejeitando o campo

**Debug:**
Adicione console.log no frontend antes do submit:
```typescript
console.log('Password being sent:', formData.password);
console.log('Password length:', formData.password?.length);
```

### Problema 3: Erro de validação
**Sintoma:** Erro 400 "Senha deve ter no mínimo 6 caracteres"

**Solução:**
- Certifique-se que a senha tem pelo menos 6 caracteres
- No modo automático, a senha gerada tem 12 caracteres (OK)

### Problema 4: Campo password é NULL no banco
**Sintoma:** Registro criado mas `password` é NULL

**Verificações:**
1. Logs do backend mostram hash sendo feito?
2. Campo `password` está no INSERT SQL?
3. Parâmetro `hashedPassword` está sendo passado?

**Debug SQL:**
```sql
-- Ver últimos hóspedes criados
SELECT id, first_name, email, password, created_at 
FROM guests 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🔍 Debug Detalhado

### Passo 1: Frontend
```typescript
// Em NewGuestModal.tsx, antes do handleSubmit
console.log('=== DEBUG GUEST CREATION ===');
console.log('Password mode:', passwordMode);
console.log('Password value:', formData.password);
console.log('Password length:', formData.password?.length);
console.log('Generated password:', generatedPassword);
```

### Passo 2: API Client
```typescript
// Em api.ts, no método createGuest
console.log('=== PAYLOAD TO BACKEND ===');
console.log(JSON.stringify(payload, null, 2));
```

### Passo 3: Backend
Os logs já foram adicionados automaticamente no GuestController.

### Passo 4: Database
```sql
-- Monitorar em tempo real (MySQL)
SELECT id, email, password, created_at 
FROM guests 
WHERE created_at > NOW() - INTERVAL 1 MINUTE;
```

---

## ✅ Teste Completo

1. **Abra o DevTools** (F12)
2. **Vá para a aba Console**
3. **Vá para a aba Network**
4. **Crie um novo hóspede** com senha
5. **Verifique:**
   - Console: Logs de debug do frontend
   - Network: Payload com campo `password`
   - Backend Console: Logs de hash
   - Database: Campo `password` preenchido

---

## 📞 Suporte

Se após todas as verificações o problema persistir:

1. Copie os logs do backend
2. Copie o payload do Network
3. Copie o resultado do `DESCRIBE guests`
4. Envie para análise

---

**Boa sorte com os testes!** 🚀
