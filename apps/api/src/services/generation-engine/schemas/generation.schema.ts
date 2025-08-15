import { z } from 'zod';

// Defines the allowed template names. This prevents requests for non-existent templates.
const TemplateEnum = z.enum(['react-fastapi', 'react-express']);

/**
 * Schema for validating the input when starting a new code generation job.
 * Ensures that the prompt is valid and a supported template is selected.
 */
export const startGenerationSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required.'),
  prompt: z
    .string()
    .min(10, 'Prompt must be at least 10 characters long.')
    .max(2000, 'Prompt must not exceed 2000 characters.'),
  templateName: TemplateEnum,
});

// We can infer the TypeScript type directly from the schema
export type StartGenerationInput = z.infer<typeof startGenerationSchema>;