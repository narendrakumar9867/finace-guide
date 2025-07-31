
---

# Backend Setup

```markdown
# 🧠 Smart Finance Tracker - Backend (API + AI + DB)

This is the backend API and RAG (Retrieval-Augmented Generation) service for the Smart Finance Tracker.

---

## ⚙️ Stack Overview

- **Backend Framework:** Node.js + Express
- **Database:** PostgreSQL
- **Background Jobs:** Redis + node-cron (Node)
- **AI/LLM:** LangChain + GPT
- **Vector DB:** ChromaDB

---

## 🧾 Core Models

- `User`: Auth, Role (Client, Sender)
- `Loan`: Amount, Sender, Client, Start/End Date
- `Installment`: Payment Date, Status, Amount
- `Reminder`: Notification Flags and Logs

---

## 📡 API Endpoints

| Method | Endpoint              | Description                      |
|--------|------------------------|----------------------------------|


---

## 🤖 AI + RAG Engine

- Built using **LangChain**
- PDF → AWS S3 → Chunk → Embed → Vector DB
- User Query → Embedded → Semantically Searched → Context + Query → Prompt → GPT → Response
- Result is sent back as **Smart Suggestion**

---

## 🔁 Background Jobs

- Built with `node-cron`
- Runs tasks like:
  - Daily due reminders
  - Late payment alerts
  - Smart repayment tips

---

## 🔐 Authentication

- JWT-based login for all routes
- Middleware handles token verification

---

## 🧪 Local Setup

```bash

npm install
npm i requirement.txt
npm run dev