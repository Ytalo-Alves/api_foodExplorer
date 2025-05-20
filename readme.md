# 🍽️ API FoodExplorer

API RESTful desenvolvida com **Fastify** e **TypeScript** para um sistema de gerenciamento de pedidos de comida. A aplicação permite cadastro de usuários, autenticação, gerenciamento de pratos, pedidos e upload de imagens para perfil e pratos.

---

## 🚀 Tecnologias Utilizadas

- **Node.js**
- **Fastify**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **JWT (Autenticação)**
- **Multer (Upload de arquivos)**
- **Zod (Validação)**
- **Swagger (Documentação da API)**

---

## 📦 Funcionalidades

### 👤 Usuários
- Cadastro de usuários
- Login/autenticação
- Atualização de dados do usuário
- Atualização de avatar (imagem de perfil)

### 🍽️ Pratos
- Criação de pratos com imagem
- Edição e remoção de pratos
- Listagem e busca de pratos

### 🧾 Pedidos
- Criação de pedidos com múltiplos itens
- Listagem de pedidos
- Atualização de status do pedido

---

## 📄 Documentação com Swagger

Acesse a documentação interativa da API:

```GET /docs```

---

## 📁 Estrutura do Projeto
```
src/
├── controllers/ # Lógicas de negócio
├── routes/ # Definições das rotas da API
├── lib/ # Configurações auxiliares (ex: JWT, upload)
├── prisma/ # Cliente e migrações do banco de dados
├── uploads/ # Arquivos enviados (avatars, imagens de pratos)
```

---

## ⚙️ Como Executar

### 1. Clone o repositório
```bash
git clone https://github.com/Ytalo-Alves/api_foodExplorer.git
cd api_foodExplorer
```

---

## ⚙️ Instale as dependências
``` npm install ```

---

## ⚙️ Configure o .env
```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/seubanco"
JWT_SECRET="chave_secreta"
```

---

## ⚙️ Execute as migrações
```
npx prisma migrate dev
```

## ⚙️ Inicie a aplicação
```
npm run start:dev
```
---

## 🛡️ Autenticação
### A autenticação utiliza JWT. Após login, inclua o token JWT no header das requisições protegidas:
```
Authorization: Bearer seu_token_aqui

```









