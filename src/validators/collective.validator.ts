import { z } from "zod";
import { Conduct } from "@prisma/client";

export const CollectiveResultSchema = z.object({
   
    sectionId: z.string({
        required_error: "Section ID is required",
    }),


    feedback: z.string({
        required_error: "Feedback is required",
    }),

    conduct: z.nativeEnum(Conduct, {
        required_error: "Conduct is required",
    }),

    
});
