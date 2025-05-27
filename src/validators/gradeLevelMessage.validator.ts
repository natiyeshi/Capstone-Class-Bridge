import { z } from "zod";

export const gradeLevelMessageSchema = z.object({
  content: z.string().nullable().optional(),
  image: z.string().optional(),
  gradeLevelId: z.string().min(1, "Grade level ID is required"),
  senderId: z.string().min(1, "Sender ID is required"),
});

export const gradeLevelMessageUpdateSchema = z.object({
  content: z.string().min(1, "Content is required").optional(),
  image: z.string().optional(),
  senderId: z.string().min(1, "Sender ID is required"),
});

export const gradeLevelMessageValidator = {
  gradeLevelMessageSchema,
  gradeLevelMessageUpdateSchema,
}; 