"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAppSession } from "@/lib/auth/session";
import type { ActionResult, CategoryTag } from "@/types";

export async function createCategoryTag(data: {
  name: string;
  color: string;
}): Promise<ActionResult<CategoryTag>> {
  const session = await getAppSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  if (session.user.activeRole !== "ADMIN") {
    return { success: false, error: "Only admins can create tags" };
  }

  try {
    const maxSort = await db.categoryTag.aggregate({
      where: { familyId: session.user.activeFamilyId },
      _max: { sortOrder: true },
    });

    const newOrder = (maxSort._max.sortOrder ?? -1) + 1;

    const tag = await db.categoryTag.create({
      data: {
        name: data.name,
        color: data.color,
        sortOrder: newOrder,
        familyId: session.user.activeFamilyId,
      },
    });

    revalidatePath("/settings");
    return { success: true, data: tag };
  } catch (error) {
    console.error("Error creating category tag:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create tag",
    };
  }
}

export async function updateCategoryTag(
  id: string,
  data: { name: string; color: string }
): Promise<ActionResult<CategoryTag>> {
  const session = await getAppSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  if (session.user.activeRole !== "ADMIN") {
    return { success: false, error: "Only admins can edit tags" };
  }

  try {
    const tag = await db.categoryTag.update({
      where: {
        id,
        familyId: session.user.activeFamilyId,
      },
      data: {
        name: data.name,
        color: data.color,
      },
    });

    revalidatePath("/settings");
    return { success: true, data: tag };
  } catch (error) {
    console.error("Error updating category tag:", error);
    return { success: false, error: "Failed to update tag" };
  }
}

export async function archiveCategoryTag(id: string): Promise<ActionResult<void>> {
  const session = await getAppSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  if (session.user.activeRole !== "ADMIN") {
    return { success: false, error: "Only admins can archive tags" };
  }

  try {
    await db.categoryTag.update({
      where: {
        id,
        familyId: session.user.activeFamilyId,
      },
      data: { isArchived: true },
    });

    revalidatePath("/settings");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error archiving category tag:", error);
    return { success: false, error: "Failed to archive tag" };
  }
}

export async function reorderCategoryTags(orderedIds: string[]): Promise<ActionResult<void>> {
  const session = await getAppSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  if (session.user.activeRole !== "ADMIN") {
    return { success: false, error: "Only admins can reorder tags" };
  }

  try {
    // Execute all updates in a single transaction
    await db.$transaction(
      orderedIds.map((id, index) =>
        db.categoryTag.update({
          where: { id, familyId: session.user.activeFamilyId },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath("/settings");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error reordering category tags:", error);
    return { success: false, error: "Failed to reorder tags" };
  }
}
