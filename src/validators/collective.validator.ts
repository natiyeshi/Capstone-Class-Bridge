import { z } from "zod";
import { Conduct } from "@prisma/client";

export const CollectiveResultSchema = z.object({
    feedback: z.string({
        required_error: "Feedback is required",
    }),

    conduct: z.nativeEnum(Conduct, {
        required_error: "Conduct is required",
    }),
    
});
