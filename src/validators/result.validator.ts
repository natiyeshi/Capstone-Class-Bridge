import { Conduct } from '@prisma/client';
import { z } from 'zod';

export const CreateResultSchema = z.object({
    test1: z.number({ message: 'Test1 must be a number' }).optional().nullable(),
    test2: z.number({ message: 'Test2 must be a number' }).optional().nullable(),
    mid: z.number({ message: 'Mid must be a number' }).optional().nullable(),
    final: z.number({ message: 'Final must be a number' }).optional().nullable(),
    conduct: z.nativeEnum(Conduct).optional(), // Updated to use the Conduct enum
    assignment: z.number({ message: 'Assignment must be a number' }).optional().nullable(),
    quiz: z.number({ message: 'Quiz must be a number' }).optional().nullable(),
    teacherId: z.string({ message: 'Invalid teacher ID' }).cuid({ message: 'Teacher ID must be a valid cuid' }),
    studentId: z.string({ message: 'Invalid student ID' }).cuid({ message: 'Student ID must be a valid cuid' }),
    sectionId: z.string({ message: 'Invalid section ID' }).cuid({ message: 'Section ID must be a valid cuid' }),
    subjectId: z.string({ message: 'Invalid subject ID' }).cuid({ message: 'Subject ID must be a valid cuid' }),
});
