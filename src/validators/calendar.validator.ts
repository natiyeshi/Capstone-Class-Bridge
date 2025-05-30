import { z } from 'zod'

export const createCalendarSchema = z.object({
  title: z.string({ message : "Title is Required!"}).min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.coerce.date({ required_error: 'Start date is required' }),
  endDate: z.coerce.date({ required_error: 'End date is required' }),
  directorId: z.string({ message : "Director is Required!"}).min(1, 'Created by (directorId) is required'),
})
