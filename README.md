# Sarees For Naaris (Sari for Nari) — Full-Stack E-Commerce & AI Assistant Platform

A full-stack, enterprise luxury saree e-commerce platform and AI virtual shopping assistant built with a **Spring Boot 3 (Java 21)** backend, **React 19** frontend, **MySQL** database, and a **Python/FastAPI** microservice featuring **LangChain & FAISS RAG**.

---

## 🌟 Key Features

1. **Enterprise Security & Auth:**
   - Stateless JWT Authentication with 6-digit OTP verification for account activation.
   - Dual-Token strategy: 1-hour Access Token + 7-day database-backed Refresh Token rotation.
   - Anti-enumeration Password Reset flow with single-use UUID reset tokens.
   - Role-Based Access Control (`USER`, `ADMIN`, `SELLER`).

2. **E-Commerce Store & Checkout:**
   - Rich catalog browsing, multi-attribute filtering (fabric, occasion, color), and search.
   - Real-time shopping cart and persistent wishlist management.
   - Integrated **Razorpay Payment Gateway** with HMAC-SHA256 signature verification & webhooks.
   - Automated **PDF Invoice Generation** using OpenPDF (LibrePDF).
   - Order lifecycle tracking (*Placed → Dispatched → Shipped → Delivered*).

3. **AI Virtual Stylist & Support (RAG Microservice):**
   - **FastAPI** AI microservice powered by **LangChain** and **SentenceTransformers** (`all-MiniLM-L6-v2`).
   - **FAISS Vector DB** for instant semantic FAQ and policy lookups.
   - Live product recommendation tool querying backend inventory in real time.

4. **Modern Glassmorphism UI:**
   - Built with **React 19**, **Vite 8**, and **React Router v7**.
   - Luxury gold-accented Glassmorphism aesthetics with smooth animations.
   - Interactive Admin dashboard for inventory, orders, analytics, and shipments.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** React 19, Vite 8, React Router v7, Lucide Icons, Vanilla CSS (`http://localhost:5173`)
- **Backend:** Java 21, Spring Boot 3.3.1, Spring Security, Spring Data JPA, OpenPDF, Razorpay SDK (`http://localhost:8080`)
- **AI Microservice:** Python 3, FastAPI, Uvicorn, LangChain, FAISS, Sentence-Transformers (`http://localhost:8000`)
- **Database:** MySQL 8.0+ / Aiven Cloud MySQL (`localhost:3306`)

---

## 🚀 Quick Setup & Run

### 1. Database Setup
Execute the schema script on your MySQL instance:
```bash
mysql -u <user> -p <database_name> < schema.sql
```

### 2. Backend (Spring Boot)
Configure your `.env` or environment variables (see `backend/.env.example`), then run:
```bash
cd backend
mvn spring-boot:run
```

### 3. AI Service (Python FastAPI)
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend (React 19)
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 License
This project is licensed under the MIT License.
