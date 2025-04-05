import { z } from 'zod';

export const CreateSectionSchema = z.object({
  name: z.string({ message: "Section Name is required!" }).min(1, {
    message: "Insert Valid Section Name",
  }),
  gradeLevelId: z.string({ message: "Grade Level is required!" }).min(1, {
    message: "Grade Level is Requried",
  }),
  homeRoom: z.string({ message: "Home Room Id should be string!" }).min(1, {
    message: "Invalid Home room id",
  }).optional().nullable(),
  students: z.array(z.string({ message: "Student id should be string!" })).optional().nullable(),
});
