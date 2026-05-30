# BLOCA - Handcrafted Jewelry E-Commerce

## Features

- **Product Catalog** — Browse products by category and subcategory
- **Authentication** — Supabase-powered login/register with role-based access
- **Shopping Cart** — Client-side cart with localStorage persistence
- **Order Management** — Full checkout flow with order history
- **Rewards System** — Points and tier system (Silver, Gold, Platinum)
- **Admin Dashboard** — Product CRUD, order management, user management, stats
- **Row Level Security** — Supabase RLS policies protecting all data
- **Responsive Design** — Mobile-first UI with Tailwind CSS

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Auth | Supabase Auth |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 5 |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI / shadcn |
| Charts | Recharts |
| State | React Context |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account and project

### 1. Clone and Install

```bash
git clone <repo-url>
cd WebBloca
npm install
```

### 2. Configure Environment

Create `.env.local` with your Supabase credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Supabase connection pooling)
DATABASE_URL="postgresql://postgres.xxx:your-password@aws-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:your-password@aws-region.pooler.supabase.com:5432/postgres"
```

Also update `.env` with the `DATABASE_URL` and `DIRECT_URL`.

### 3. Setup Database

```bash
# Push Prisma schema to Supabase
npm run db:push

# Seed product data
npm run db:seed
```

### 4. Configure Supabase RLS

Run the SQL in `supabase-setup.sql` in your **Supabase Dashboard → SQL Editor**. This will:

- Enable Row Level Security on all tables
- Create auth trigger for auto-creating user profiles on signup
- Set up policies for users, products, orders, cart, and wishlist

### 5. Set Admin Role

After registering your first account, run in **Supabase SQL Editor**:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Or via Prisma:

```bash
npx tsx -e "
  const { PrismaClient } = require('./lib/generated/prisma');
  const p = new PrismaClient();
  p.user.updateMany({ where: { email: 'your-email@example.com' }, data: { role: 'ADMIN' } })
    .then(r => { console.log(r); p.\$disconnect(); });
"
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  api/                    # API routes
    products/             # GET all, POST new
    products/[id]/        # GET, PUT, DELETE
    cart/                 # GET, POST, DELETE
    orders/               # GET user orders, POST checkout
    admin/
      dashboard/          # GET stats
      orders/              # GET all orders
      orders/[id]/        # GET, PUT order status
      users/               # GET all users
      users/[id]/          # GET, PUT user role/tier
    auth/                 # POST ensure profile exists
    upload/               # POST image upload
  admin/                  # Admin dashboard pages
    layout.tsx            # Admin sidebar layout
    page.tsx              # Dashboard overview
    products/             # Product list, new, edit
    orders/               # Order list, detail
    users/                # User list, detail
    settings/             # Store settings
  auth/                   # Login & Register pages
  account/                # User account pages
  products/[id]/          # Product detail page
  shop/                   # Shop/browse page
lib/
  supabase/
    client.ts             # Browser Supabase client
    server.ts             # Server Supabase client
  prisma.ts              # Prisma client singleton
  auth.ts                # Auth helpers (requireAuth, requireAdmin)
  products.ts            # Product data with API fetch
context/
  auth-context.tsx         # Auth state (Supabase)
  cart-context.tsx         # Cart state (localStorage)
components/               # UI components
prisma/
  schema.prisma           # Database schema
  seed.ts                 # Product seed data
proxy.ts                  # Next.js 16 auth proxy (route protection)
```

## Available Scripts



| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema changes to database |
| `npm run db:seed` | Seed product data |
| `npm run db:migrate` | Run Prisma migrations |

## Database Models

- **User** — id, email, name, phone, address, role (USER/ADMIN), points, tier (SILVER/GOLD/PLATINUM)
- **Product** — id, name, price, image, category, subCategory, isSale, description, features, stock
- **Order** — id, userId, status (PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED), totalAmount, shippingAddress
- **OrderItem** — id, orderId, productId, quantity, priceAtPurchase
- **CartItem** — id, userId, productId, quantity
- **WishlistItem** — id, userId, productId

## Admin Dashboard

Access at `/admin` (requires ADMIN role):

- **Dashboard** — Revenue, orders, users, products stats with charts
- **Products** — List, add, edit, delete products
- **Orders** — View all orders, update order status
- **Users** — View user list, edit roles and tiers
- **Settings** — Store configuration

## License

Private