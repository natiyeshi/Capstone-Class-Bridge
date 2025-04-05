import { GradeLevel } from "@prisma/client";
import { z } from "zod";

export const GradeLevelSchema = z.object({
    level: z.string({ message: 'Level is required' }).min(1, { message: 'Level is required' }),
    subjectList: z.array(z.string({ message : "Subject id is not valid."})).default([]), // Replace `z.any()` with the actual Subject schema
  });
  

export const updateGradeLevelSchema =
  GradeLevelSchema.partial() satisfies z.ZodType<
    Partial<Omit<GradeLevel, "id" | "createdAt">>
  >;