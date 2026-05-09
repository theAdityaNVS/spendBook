import { PrismaClient, PaymentModeType, Role } from "../src/generated/prisma";

const prisma = new PrismaClient();

const DEFAULT_CATEGORY_TAGS = [
  { name: "Food Delivery", color: "#f97316", sortOrder: 0 },
  { name: "Groceries", color: "#22c55e", sortOrder: 1 },
  { name: "Shopping", color: "#8b5cf6", sortOrder: 2 },
  { name: "Subscriptions", color: "#3b82f6", sortOrder: 3 },
  { name: "Utilities", color: "#6366f1", sortOrder: 4 },
  { name: "Transport", color: "#f59e0b", sortOrder: 5 },
  { name: "Entertainment", color: "#ec4899", sortOrder: 6 },
  { name: "Healthcare", color: "#14b8a6", sortOrder: 7 },
  { name: "Education", color: "#0ea5e9", sortOrder: 8 },
  { name: "Miscellaneous", color: "#94a3b8", sortOrder: 9 },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@spendbook.app" },
    update: {},
    create: {
      email: "admin@spendbook.app",
      name: "Aditya (Admin)",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "rahul@spendbook.app" },
    update: {},
    create: {
      email: "rahul@spendbook.app",
      name: "Rahul",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "priya@spendbook.app" },
    update: {},
    create: {
      email: "priya@spendbook.app",
      name: "Priya",
    },
  });

  // Create demo family
  const family = await prisma.family.upsert({
    where: { id: "demo-family-id" },
    update: {},
    create: {
      id: "demo-family-id",
      name: "Nadamuni Household",
      defaultCurrency: "INR",
    },
  });

  // Link users to family
  const roles = [
    { userId: admin.id, role: Role.ADMIN, name: "Family Account" },
    { userId: user2.id, role: Role.FAMILY, name: "Rahul" },
    { userId: user3.id, role: Role.PERSON, name: "Priya" },
  ];

  for (const r of roles) {
    const person = await prisma.person.upsert({
      where: { id: `demo-person-${r.name.toLowerCase()}` },
      update: {},
      create: {
        id: `demo-person-${r.name.toLowerCase()}`,
        name: r.name,
        familyId: family.id,
        isFamilyAccount: r.role === Role.ADMIN,
      },
    });

    await prisma.userFamily.upsert({
      where: { userId_familyId: { userId: r.userId, familyId: family.id } },
      update: {},
      create: {
        userId: r.userId,
        familyId: family.id,
        role: r.role,
        personId: person.id,
      },
    });
  }

  // Seed default category tags
  for (const tag of DEFAULT_CATEGORY_TAGS) {
    await prisma.categoryTag.upsert({
      where: {
        id: `demo-tag-${tag.sortOrder}`,
      },
      update: {},
      create: {
        id: `demo-tag-${tag.sortOrder}`,
        ...tag,
        familyId: family.id,
      },
    });
  }

  // Seed default family-owned payment modes
  await prisma.paymentMode.upsert({
    where: { id: "demo-mode-cash" },
    update: {},
    create: {
      id: "demo-mode-cash",
      name: "Family Cash",
      type: PaymentModeType.CASH,
      familyId: family.id,
      ownerPersonId: null, // family-owned
    },
  });

  await prisma.paymentMode.upsert({
    where: { id: "demo-mode-upi" },
    update: {},
    create: {
      id: "demo-mode-upi",
      name: "Family UPI",
      type: PaymentModeType.UPI,
      familyId: family.id,
      ownerPersonId: null,
    },
  });

  // Seed a person-owned mode
  await prisma.paymentMode.upsert({
    where: { id: "demo-mode-rahul-cash" },
    update: {},
    create: {
      id: "demo-mode-rahul-cash",
      name: "Rahul Cash",
      type: PaymentModeType.CASH,
      familyId: family.id,
      ownerPersonId: "demo-person-rahul",
    },
  });

  console.log("✅ Seed complete.");
  console.log(`   Demo user: demo@spendbook.app (sign up via Neon Auth)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
