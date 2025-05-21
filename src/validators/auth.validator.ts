import { USER_ROLE, User } from "@prisma/client";
import * as z from "zod";

export const signUpSchema = z.object({
  firstName: z
    .string({ message: "First name has to be a string" })
    .trim()
    .min(1, {
      message: "First name is required.",
    }),
  lastName: z
    .string({ message: "Last name has to be a string" })
    .trim()
    .min(1, {
      message: "Last name is required.",
    }),
  email: z.string({ message: "Email has to be a string" }).email({
    message: "Invalid email.",
  }),
  password: z.string({ message: "Password has to be a string" }).trim().min(1, {
    message: "Password field is required.",
  }),
  phoneNumber: z.string({ message: "Phone number has to be a string" }),
  gender: z
    .enum(["M", "F"], { message: "Gender must be either 'M' or 'F'" })
    .optional(),
  dateOfBirth: z
    .string({ message: "Date of birth has to be a string" })
    .optional(),
  profile: z
    .string({ message: "Profile has to be a string" })
    .optional(),
  isSMSUser: z
    .boolean({ message: "isSMSUser must be a boolean" })
    .optional()
    .default(false),
})

export const signUpStudentSchema = z.object({
 
  firstName: z
    .string({ message: "First name has to be a string" })
    .trim()
    .min(1, {
      message: "First name is required.",
    }),
  lastName: z
    .string({ message: "Last name has to be a string" })
    .trim()
    .min(1, {
      message: "Last name is required.",
    }),
  email: z.string({ message: "Email has to be a string" }).email({
    message: "Invalid email.",
  }),
  password: z.string({ message: "Password has to be a string" }).trim().min(1, {
    message: "Password field is required.",
  }),
  phoneNumber: z.string({ message: "Phone number has to be a string" }),
  gender: z
    .enum(["M", "F"], { message: "Gender must be either 'M' or 'F'" })
    .optional(),
  profile: z
    .string({ message: "Profile has to be a string" })
    .optional(),
  dateOfBirth: z
    .string({ message: "Date of birth has to be a string" })
    .optional(),
  parentId: z
  .string({ message: "Parent Id has to be a string" })
  .trim()
  .cuid({ message : "Invalid Parent Id" })
  .min(1, {
    message: "Parent Id is required.",
  }),
})


export const signInSchema = z.object({
  email: z.string({ message: "Email has to be a string" }).email({
    message: "Invalid email.",
  }),
  password: z.string({ message: "Password has to be a string" }).trim().min(1, {
    message: "Password field is required.",
  }),
}) satisfies z.ZodType<Pick<User, "email" | "password">>;

export const updateROLESchema = z.object({
  userId: z
    .string({
      message: "UserId has to be a string",
    })
    .min(1, {
      message: "UserId field is required.",
    }),
  role: z.enum(
    [USER_ROLE.UNKNOWN, USER_ROLE.TEACHER, USER_ROLE.DIRECTOR, USER_ROLE.PARENT],
    {
      message: "Invalid user role.",
    }
  ),
});


export const changePasswordSchema = z.object({
  oldPassword: z
    .string({ message: "Old password has to be a string" })
    .trim()
    .min(1, {
      message: "Old password field is required.",
    }),
  newPassword: z
    .string({ message: "New password has to be a string" })
    .trim()
    .min(1, {
      message: "New password field is required.",
    }),
});
