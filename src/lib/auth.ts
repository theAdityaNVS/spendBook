import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { loginSchema } from "@/lib/validators"
import { authConfig } from "@/lib/auth.config"
import type { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      activeFamilyId: string
      activeRole: Role
    }
  }
  interface JWT {
    id: string
    activeFamilyId: string
    activeRole: Role
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user?.password) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        // Load the user's first family to set as active
        const userFamily = await db.userFamily.findFirst({
          where: { userId: user.id as string },
          orderBy: { createdAt: "asc" },
        })
        token.activeFamilyId = userFamily?.familyId ?? ""
        token.activeRole = userFamily?.role ?? "PERSON"
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.activeFamilyId = token.activeFamilyId as string
        session.user.activeRole = token.activeRole as Role
      }
      return session
    },
  },
})
