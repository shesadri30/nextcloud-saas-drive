# NextCloud SaaS Drive Storage Platform

> A multi-tenant SaaS platform for private file storage using Nextcloud as frontend and S3-compatible object storage (Cloudflare R2 / Backblaze B2 / Custom) as the backend.

---

## 📌 Project Overview

This platform allows users to purchase a private cloud storage plan. Upon purchase, the admin provisions a dedicated Nextcloud instance for the user, connected to a configured S3-compatible storage bucket. The marketing/billing website handles pricing, subscriptions, and user management.

---

## 🏗️ Architecture

```
User → Marketing Website (Next.js)
         ├── Pricing Table
         ├── Auth (NextAuth.js)
         ├── Payment (Stripe)
         └── Subscription Management

Admin Panel (Next.js Admin)
         ├── User Management
         ├── Nextcloud Instance Provisioning
         ├── Storage Quota Management
         └── Billing Overview

Nextcloud Instance (per user)
         └── Connected to S3-Compatible Storage
                  ├── Cloudflare R2
                  ├── Backblaze B2
                  └── Custom S3 Endpoint
```

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend Website | Next.js 14 (App Router) |
| Admin Panel | Next.js 14 + shadcn/ui |
| User Panel | Next.js 14 |
| Auth | NextAuth.js v5 |
| Payments | Stripe |
| Database | PostgreSQL + Prisma ORM |
| File Storage Frontend | Nextcloud (Docker) |
| Object Storage | Cloudflare R2 / Backblaze B2 / Custom S3 |
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx / Caddy |
| Deployment | VPS / Cloud VM |

---

## 📁 Repository Structure

```
nextcloud-saas-drive/
├── apps/
│   ├── web/                    # Marketing website (Next.js)
│   ├── admin/                  # Admin panel (Next.js)
│   └── user-panel/             # User dashboard (Next.js)
├── packages/
│   ├── db/                     # Prisma schema + migrations
│   ├── ui/                     # Shared UI components (shadcn)
│   └── config/                 # Shared configs (ESLint, TS, Tailwind)
├── infra/
│   ├── docker/                 # Nextcloud Docker configs
│   ├── nginx/                  # Reverse proxy config
│   └── scripts/                # Provisioning scripts
├── docs/
│   └── blueprint.md            # Full technical blueprint
├── .env.example
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
```

---

## 💰 Pricing Plans

| Plan | Storage | Price/Month | Nextcloud Instance |
|---|---|---|---|
| Starter | 50 GB | $5 | Shared |
| Personal | 200 GB | $12 | Dedicated |
| Pro | 1 TB | $29 | Dedicated |
| Business | 5 TB | $99 | Dedicated + Priority Support |
| Enterprise | Custom | Custom | Custom |

---

## ⚙️ Setup & Development

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker + Docker Compose
- PostgreSQL
- Stripe account
- S3-compatible storage credentials

### Getting Started

```bash
# Clone the repo
git clone https://github.com/shesadri30/nextcloud-saas-drive.git
cd nextcloud-saas-drive

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Run database migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

---

## 🔑 Environment Variables

See `.env.example` for all required variables.

---

## 🔒 Security

- All Nextcloud instances are isolated per user
- Storage buckets scoped per user with unique credentials
- HTTPS enforced via Caddy auto-SSL
- Row-level security in PostgreSQL
- Stripe handles all payment data (PCI compliant)

---

## 📄 License

Private — All rights reserved © SHESADRI SOFTECH PRIVATE LIMITED
