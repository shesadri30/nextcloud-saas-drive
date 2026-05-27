# SaaS NextCloud Drive Storage — Full Technical Blueprint

**Product:** NextCloud SaaS Drive
**Company:** SHESADRI SOFTECH PRIVATE LIMITED
**Version:** 1.0.0

---

## 1. Product Vision

Build a white-label SaaS product where customers can purchase private cloud storage. Each customer gets their own isolated Nextcloud instance connected to S3-compatible object storage. The platform handles billing, provisioning, and management automatically.

---

## 2. Core Features

### 2.1 Marketing Website (Public)
- Landing page with product features
- Pricing table with plan comparison
- User registration & login (NextAuth.js)
- Stripe-powered checkout
- Subscription management (upgrade/downgrade/cancel)
- Invoice history & billing portal

### 2.2 User Panel (Post-login)
- Dashboard with storage usage overview
- Link/button to open their Nextcloud instance
- Subscription status & renewal date
- Support ticket system
- Account settings & password change

### 2.3 Admin Panel
- Dashboard: total users, revenue, active instances
- User management (list, search, suspend, delete)
- Nextcloud instance management (provision, restart, delete)
- Storage quota adjustment per user
- Subscription & payment overview
- S3 storage provider configuration
- System health monitoring

---

## 3. User Journey

```
1. User visits website
2. Browses pricing table
3. Selects a plan → Register/Login
4. Completes Stripe payment
5. Webhook triggers provisioning job
6. Admin provisions Nextcloud instance (manual or auto)
7. User receives email with Nextcloud login URL
8. User accesses their private cloud drive
9. Monthly billing cycle continues
10. User can upgrade/downgrade/cancel anytime
```

---

## 4. Database Schema (Prisma)

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  passwordHash  String?
  role          Role           @default(USER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  subscription  Subscription?
  instance      NextcloudInstance?
  invoices      Invoice[]
}

enum Role {
  USER
  ADMIN
}

model Plan {
  id            String         @id @default(cuid())
  name          String
  storageGB     Int
  priceMonthly  Float
  stripePriceId String         @unique
  isActive      Boolean        @default(true)
  subscriptions Subscription[]
}

model Subscription {
  id                  String    @id @default(cuid())
  userId              String    @unique
  user                User      @relation(fields: [userId], references: [id])
  planId              String
  plan                Plan      @relation(fields: [planId], references: [id])
  stripeSubscriptionId String   @unique
  stripeCustomerId    String
  status              SubStatus @default(ACTIVE)
  currentPeriodStart  DateTime
  currentPeriodEnd    DateTime
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

enum SubStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  TRIALING
  PAUSED
}

model NextcloudInstance {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])
  subdomain     String    @unique
  status        InstanceStatus @default(PENDING)
  storageGB     Int
  s3Bucket      String
  s3Endpoint    String
  s3AccessKey   String
  s3SecretKey   String    // encrypted at rest
  dockerContainerId String?
  provisionedAt DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum InstanceStatus {
  PENDING
  PROVISIONING
  ACTIVE
  SUSPENDED
  TERMINATED
}

model Invoice {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  stripeInvoiceId String   @unique
  amount          Float
  currency        String   @default("usd")
  status          String
  paidAt          DateTime?
  createdAt       DateTime @default(now())
}
```

---

## 5. API Routes (Next.js App Router)

### Public Routes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/plans` | List all active plans |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/[...nextauth]` | NextAuth handler |

### Authenticated User Routes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/user/subscription` | Get current subscription |
| POST | `/api/user/checkout` | Create Stripe checkout session |
| POST | `/api/user/portal` | Open Stripe billing portal |
| GET | `/api/user/instance` | Get Nextcloud instance details |
| GET | `/api/user/invoices` | List invoices |

### Admin Routes (role: ADMIN)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users` | List all users |
| PATCH | `/api/admin/users/[id]` | Update user |
| DELETE | `/api/admin/users/[id]` | Delete user |
| POST | `/api/admin/instances/provision` | Provision instance |
| DELETE | `/api/admin/instances/[id]` | Terminate instance |
| PATCH | `/api/admin/instances/[id]/quota` | Update storage quota |

### Webhook Routes
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/webhooks/stripe` | Stripe event handler |

---

## 6. Stripe Webhook Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create subscription record, trigger provisioning |
| `invoice.payment_succeeded` | Update subscription period, record invoice |
| `invoice.payment_failed` | Mark subscription as PAST_DUE, notify user |
| `customer.subscription.deleted` | Cancel subscription, suspend instance |
| `customer.subscription.updated` | Handle plan change, update quota |

---

## 7. Nextcloud Provisioning Flow

```bash
# Per-user provisioning steps:
1. Create unique S3 bucket (user-{userId}-{timestamp})
2. Generate unique S3 credentials (scoped to bucket)
3. Pull nextcloud:latest Docker image
4. Create Docker container with env vars:
   - NEXTCLOUD_ADMIN_USER
   - NEXTCLOUD_ADMIN_PASSWORD
   - OBJECTSTORE_S3_HOST
   - OBJECTSTORE_S3_BUCKET
   - OBJECTSTORE_S3_KEY
   - OBJECTSTORE_S3_SECRET
   - OBJECTSTORE_S3_PORT
   - OBJECTSTORE_S3_SSL
   - OBJECTSTORE_S3_REGION
5. Configure Nginx/Caddy reverse proxy
6. Point subdomain: {username}.yourdomain.com → container
7. Set storage quota via occ command
8. Send welcome email with login URL
```

---

## 8. S3-Compatible Storage Providers

### Cloudflare R2
```env
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=<r2-access-key>
S3_SECRET_ACCESS_KEY=<r2-secret-key>
```

### Backblaze B2
```env
S3_ENDPOINT=https://s3.<region>.backblazeb2.com
S3_REGION=<region>
S3_ACCESS_KEY_ID=<b2-key-id>
S3_SECRET_ACCESS_KEY=<b2-app-key>
```

### Custom S3
```env
S3_ENDPOINT=https://your-minio-or-compatible-endpoint.com
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=<access-key>
S3_SECRET_ACCESS_KEY=<secret-key>
```

---

## 9. Infrastructure Overview

```
Internet
    │
    ▼
Caddy / Nginx (Reverse Proxy + Auto SSL)
    │
    ├── yourdomain.com         → Next.js Web App (port 3000)
    ├── admin.yourdomain.com   → Next.js Admin Panel (port 3001)
    ├── app.yourdomain.com     → Next.js User Panel (port 3002)
    └── *.yourdomain.com       → Nextcloud containers (dynamic ports)

PostgreSQL DB (port 5432)
Redis (port 6379) — session/queue
Docker socket — for provisioning containers
```

---

## 10. Pricing Table Design

| Feature | Starter | Personal | Pro | Business |
|---------|---------|---------|-----|---------|
| Storage | 50 GB | 200 GB | 1 TB | 5 TB |
| Price/mo | $5 | $12 | $29 | $99 |
| Instance | Shared | Dedicated | Dedicated | Dedicated |
| Custom Domain | ❌ | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ❌ | ✅ |
| SLA | ❌ | ❌ | ❌ | 99.9% |
| Max File Size | 2 GB | 5 GB | 20 GB | 50 GB |

---

## 11. Security Considerations

- S3 secret keys encrypted at rest (AES-256)
- Each Nextcloud instance runs in isolated Docker network
- Reverse proxy enforces HTTPS only
- Admin routes protected by role middleware
- Stripe webhook signature verification
- Rate limiting on auth endpoints
- CSRF protection on all forms
- PostgreSQL row-level security

---

## 12. Roadmap

### Phase 1 — MVP
- [ ] Marketing website with pricing
- [ ] Stripe checkout & subscription
- [ ] Manual admin provisioning panel
- [ ] Basic user dashboard

### Phase 2 — Automation
- [ ] Auto-provisioning on payment webhook
- [ ] S3 bucket auto-creation
- [ ] Email notifications
- [ ] Subdomain auto-routing

### Phase 3 — Scale
- [ ] Multi-region support
- [ ] Custom domain per user
- [ ] Team/organization plans
- [ ] Usage analytics dashboard
- [ ] Mobile app (React Native)
