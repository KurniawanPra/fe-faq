# FAQ Portal PT INL — Frontend (Next.js)

The modern, responsive frontend for the **FAQ PT INL**, built with **Next.js 15**, **React 19**, and **Tailwind CSS**.

## 🚀 Setup Guide

### 1. Requirements
* Node.js ^20.x
* NPM or PNPM

### 2. Installation Steps
Navigate to the frontend directory and install dependencies:
```bash
cd "front end"
npm install
```

### 3. Environment Configuration
Create a local environment file:
```bash
cp .env.example .env.local
```
Ensure the `NEXT_PUBLIC_API_URL` matches your backend URL (usually `http://localhost:8000`).

### 4. Running the Development Server
Start the Next.js dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the website.

---

## ✨ Features
*   **Dynamic Search**: FAQ filtering with search suggestions based on popular topics.
*   **Admin Dashboard**: Professional administrative interface to manage FAQs and User Inquiries.
*   **Responsive Design**: Fully mobile-responsive layouts (optimized for desktop, tablet, and mobile).
*   **Modern UI**: Built with a custom design system using Tailwind CSS v4.
*   **Real-time Analytics**: Interactive charts and live status tracking in the admin overview.

## 📁 Project Structure
*   `app/`: Next.js App Router (pages and layouts).
*   `src/components/`: Reusable React components.
*   `src/lib/api.ts`: Centralized API service using Fetch.
*   `src/types/`: TypeScript interface definitions.
*   `public/`: Static assets (images, logos).

---
© 2026 PT Industri Nabati Lestari
