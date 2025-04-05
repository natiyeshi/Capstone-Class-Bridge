// import { z } from "zod";

// // Enum for USER_ROLE
// const UserRoleEnum = z.enum(["UNKNOWN", "ADMIN", "TEACHER", "STUDENT", "PARENT", "DIRECTOR"]);

// // User validation schema
// export const userValidator = z.object({
//     email: z.string().email(),
//     password: z.string().min(8), // Minimum password length of 8 characters
//     firstName: z.string().min(1, "First name is required"),
//     lastName: z.string().min(1, "Last name is required"),
//     phoneNumber: z.string().optional(),
//     role: UserRoleEnum.optional(),
// });

// // Example usage
// export type User = z.infer<typeof userValidator>;