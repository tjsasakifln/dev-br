import { z } from 'zod';

/**
 * Schema for a loaded project template.
 * Validates that the template is a record of file paths (string) to file content (string).
 */
export const templateSchema = z.record(z.string());

export type TemplateData = z.infer<typeof templateSchema>;