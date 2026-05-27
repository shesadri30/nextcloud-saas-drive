import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed Plans
  const plans = [
    {
      name: "Starter",
      storageGB: 50,
      priceMonthly: 5,
      stripePriceId: process.env.STRIPE_PRICE_STARTER ?? "price_starter",
    },
    {
      name: "Personal",
      storageGB: 200,
      priceMonthly: 12,
      stripePriceId: process.env.STRIPE_PRICE_PERSONAL ?? "price_personal",
    },
    {
      name: "Pro",
      storageGB: 1000,
      priceMonthly: 29,
      stripePriceId: process.env.STRIPE_PRICE_PRO ?? "price_pro",
    },
    {
      name: "Business",
      storageGB: 5000,
      priceMonthly: 99,
      stripePriceId: process.env.STRIPE_PRICE_BUSINESS ?? "price_business",
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`  ✅ Plan: ${plan.name}`);
  }

  // Seed Admin User
  const { hash } = await import("bcryptjs");
  await prisma.user.upsert({
    where: { email: "admin@yourdomain.com" },
    update: {},
    create: {
      email: "admin@yourdomain.com",
      name: "Super Admin",
      passwordHash: await hash("Admin@123!", 12),
      role: "ADMIN",
    },
  });
  console.log("  ✅ Admin user created: admin@yourdomain.com");

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
