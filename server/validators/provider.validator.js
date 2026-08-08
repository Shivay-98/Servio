const { z } = require('zod');

const updateProfileSchema = z.object({
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  dateOfBirth: z.string().optional(),
  languages: z.array(z.string().trim()).optional(),
  experience: z
    .object({
      years: z.number().min(0).max(50).optional(),
      description: z.string().optional(),
    })
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string().optional(),
        institution: z.string().optional(),
        year: z.number().optional(),
      })
    )
    .optional(),
  skills: z.array(z.string().trim()).optional(),
  categories: z.array(z.string()).optional(),
  workingHours: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
      days: z
        .array(
          z.enum([
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ])
        )
        .optional(),
    })
    .optional(),
  pricing: z
    .object({
      hourlyRate: z.number().min(0).optional(),
      currency: z.string().optional(),
      minimumCharge: z.number().min(0).optional(),
    })
    .optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  availability: z
    .enum(['available', 'busy', 'on_leave', 'offline'])
    .optional(),
});

const reviewApplicationSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z.string().optional(),
});

module.exports = {
  updateProfileSchema,
  reviewApplicationSchema,
};
