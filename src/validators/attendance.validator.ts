import { z } from 'zod'
import { status } from '@prisma/client'

export const createAttendanceSchema = z.object({
    studentId: z.string({ message: "Invalid student ID" }).cuid({ message: "Invalid student ID" }),
    sectionId: z.string({ message: "Invalid section ID" }).cuid({ message: "Invalid section ID" }),
    date: z.coerce.date().refine(date => !isNaN(date.getTime()), {
        message: "Invalid date",
    }),
    status: z.nativeEnum(status, {
        message: "Invalid status value",
    }),
})
