import { z } from "zod";

export const SubjectValidator = z.object({
    name: z.string({ message : "Subject Name is required!"}) .min(1, {
        message: "Insert Valid Subject",
      }),
});
