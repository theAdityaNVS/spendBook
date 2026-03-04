import { z } from "zod"

// ─── Person schemas ─────────────────────────────────────────────────────────

export const createPersonSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
})

export const updatePersonSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, "Name is required").max(80),
})

// ─── Transaction schemas ──────────────────────────────────────────────────────

export const createTransactionSchema = z.object({
  personId: z.string().cuid("Invalid person"),
  type: z.enum(["DEBIT", "CREDIT", "PAYMENT"]),
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(500).optional(),
  categoryTagId: z.string().cuid().optional().nullable(),
  paymentModeId: z.string().cuid().optional().nullable(),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Amount must be a positive number",
    }),
  currency: z.string().length(3).default("INR"),
  paidTowards: z.enum(["PERSONAL", "FAMILY"]).default("PERSONAL"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
})

export const updateTransactionSchema = createTransactionSchema.extend({
  id: z.string().cuid(),
})

export const deleteTransactionSchema = z.object({
  id: z.string().cuid(),
})

// ─── Settings schemas ──────────────────────────────────────────────────────────

export const createCategoryTagSchema = z.object({
  name: z.string().min(1).max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
})

export const createPaymentModeSchema = z.object({
  name: z.string().min(1).max(80),
  type: z.enum([
    "CREDIT_CARD",
    "DEBIT_CARD",
    "UPI",
    "CASH",
    "WALLET",
    "NET_BANKING",
  ]),
  ownerPersonId: z.string().cuid().optional().nullable(),
})

// Inferred types
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type CreatePersonInput = z.infer<typeof createPersonSchema>
