import { PrismaClient, PaymentModeType, Role } from "@prisma/client"

const prisma = new PrismaClient()

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
]

async function main() {
  console.log("🌱 Seeding database...")

  // Create demo admin user (Neon Auth handles actual credentials)
  const user = await prisma.user.upsert({
    where: { email: "demo@spendbook.app" },
    update: {},
    create: {
      email: "demo@spendbook.app",
      name: "Demo Admin",
    },
  })

  // Create demo family
  const family = await prisma.family.upsert({
    where: { id: "demo-family-id" },
    update: {},
    create: {
      id: "demo-family-id",
      name: "Demo Household",
      defaultCurrency: "INR",
    },
  })

  // Create Family Account (built-in person)
  const familyAccount = await prisma.person.upsert({
    where: { id: "demo-family-account-id" },
    update: {},
    create: {
      id: "demo-family-account-id",
      name: "Family Account",
      familyId: family.id,
      isFamilyAccount: true,
    },
  })

  // Create a sample person
  const person1 = await prisma.person.upsert({
    where: { id: "demo-person-1-id" },
    update: {},
    create: {
      id: "demo-person-1-id",
      name: "Rahul",
      familyId: family.id,
    },
  })

  // Link admin user to family
  await prisma.userFamily.upsert({
    where: { userId_familyId: { userId: user.id, familyId: family.id } },
    update: {},
    create: {
      userId: user.id,
      familyId: family.id,
      role: Role.ADMIN,
      personId: familyAccount.id,
    },
  })

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
    })
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
  })

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
  })

  // Seed a person-owned mode
  await prisma.paymentMode.upsert({
    where: { id: "demo-mode-rahul-cash" },
    update: {},
    create: {
      id: "demo-mode-rahul-cash",
      name: "Rahul Cash",
      type: PaymentModeType.CASH,
      familyId: family.id,
      ownerPersonId: person1.id,
    },
  })

  console.log("✅ Seed complete.")
  console.log(`   Demo user: demo@spendbook.app (sign up via Neon Auth)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => void prisma.$disconnect())
