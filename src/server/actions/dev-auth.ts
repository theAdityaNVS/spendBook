"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function switchDevUserAction(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set("dev_user_id", userId, { path: "/" })
  revalidatePath("/")
}

export async function clearDevUserAction() {
  const cookieStore = await cookies()
  cookieStore.delete("dev_user_id")
  revalidatePath("/")
}
