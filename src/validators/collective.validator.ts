import { z } from "zod";
import { Conduct } from "@prisma/client";

export const CollectiveResultSchema = z.object({
    studentId: z.string({
        required_error: "Student ID is required",
    }),

    sectionId: z.string({
        required_error: "Section ID is required",
    }),

    rank: z.number({
        required_error: "Rank is required",
    }).int("Rank must be an integer"),

    feedback: z.string({
        required_error: "Feedback is required",
    }),

    result: z.array(z.any({ required_error: "Result is required" }), {
        required_error: "Result is required",
    }),

    conduct: z.nativeEnum(Conduct, {
        required_error: "Conduct is required",
    }),

    
});
