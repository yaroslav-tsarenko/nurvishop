import { z } from "zod";

// Error messages are stable i18n keys (namespace "validation") — see ./messages.ts.
export const contactSchema = z.object({
  name: z.string().min(1, "validation.nameRequired"),
  email: z.string().email("validation.emailInvalid"),
  subject: z.string().min(1, "validation.subjectRequired"),
  message: z.string().min(10, "validation.messageTooShort"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
