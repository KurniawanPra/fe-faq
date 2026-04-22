# FAQ Portal – PT INL

Pusat bantuan dan portal FAQ untuk PT INL, dibangun dengan **Next.js 16** dan **TypeScript**.

---

## Tech Stack

| Layer      | Teknologi                                       |
| :--------- | :---------------------------------------------- |
| Framework  | Next.js 16 (App Router)                         |
| Language   | TypeScript                                      |
| Styling    | CSS Modules + Tailwind CSS v4                   |
| State      | React `useState` / `useSearchParams`            |
| Font       | DM Sans, DM Mono, Instrument Serif (Google CDN) |

---

## Struktur Folder

```
faq-inl/
│
├── app/                        # Next.js App Router (routing only)
│   ├── (landing)/              # Route group: halaman publik
│   │   ├── layout.tsx          # Layout landing (Navbar + SearchHeader)
│   │   └── page.tsx            # Halaman utama FAQ
│   │
│   ├── dashboard/              # Route group: admin dashboard
│   │   ├── layout.tsx          # Layout dashboard (Sidebar)
│   │   ├── page.tsx            # Halaman overview
│   │   ├── questions/          # Kelola FAQ
│   │   │   └── page.tsx
│   │   └── user-inquiries/     # Kelola pertanyaan user
│   │       └── page.tsx
│   │
│   ├── api/                    # Next.js API Routes (mock/stub)
│   │   ├── faqs/route.ts
│   │   ├── questions/route.ts
│   │   ├── topics/route.ts
│   │   └── user-inquiries/route.ts
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── globals.css             # Global CSS tokens & base reset
│   └── layout.tsx              # Root layout (html + body)
│
├── src/                        # Source code (komponen, tipe, data)
│   ├── components/             # UI Components (masing-masing 1 folder)
│   │   ├── Navbar/
│   │   │   ├── Navbar.tsx
│   │   │   └── Navbar.module.css
│   │   ├── SearchHeader/
│   │   │   ├── SearchHeader.tsx
│   │   │   └── SearchHeader.module.css
│   │   ├── FAQCards/
│   │   │   ├── FAQCards.tsx
│   │   │   └── FAQCards.module.css
│   │   ├── DashboardSidebar/
│   │   │   ├── DashboardSidebar.tsx
│   │   │   └── DashboardSidebar.module.css
│   │   └── index.ts            # Barrel export
│   │
│   ├── data/                   # Data statis / mock
│   │   └── faq-data.ts
│   │
│   └── types/                  # TypeScript interfaces & types
│       └── faq.ts
│
├── public/                     # Aset statis
│   └── img/
│       └── logo.png
│
├── docs/                       # Dokumentasi
│   └── API.md                  # Kontrak API untuk backend (Laravel)
│
├── next.config.ts
├── tsconfig.json               # @/* alias → src/*
├── package.json
└── README.md
```

---

## Cara Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Path Alias

| Alias             | Resolves To            |
| :---------------- | :--------------------- |
| `@/components`    | `src/components/`      |
| `@/types`         | `src/types/`           |
| `@/data`          | `src/data/`            |

---

## Dokumentasi API

Lihat [`docs/API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md) untuk detail endpoint, parameter request, dan format response API yang digunakan.
# fe-faq
