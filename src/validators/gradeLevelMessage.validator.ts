import { z } from "zod";

export const gradeLevelMessageSchema = z.object({
  content: z.string().min(1, "Content is required"),
  image: z.string().optional(),
  gradeLevelId: z.string().min(1, "Grade level ID is required"),
});

export const gradeLevelMessageUpdateSchema = z.object({
  content: z.string().min(1, "Content is required").optional(),
  image: z.string().optional(),
});

export const gradeLevelMessageValidator = {
  gradeLevelMessageSchema,
  gradeLevelMessageUpdateSchema,
}; 