import { z } from "zod";

// Error messages are stable i18n keys (namespace "validation") — see ./messages.ts.
export const profileSchema = z.object({
  name: z.string().min(1, "validation.nameRequired"),
  phone: z.string().optional(),
});

export const addressSchema = z.object({
  firstName: z.string().min(1, "validation.firstNameRequired"),
  lastName: z.string().min(1, "validation.lastNameRequired"),
  address1: z.string().min(1, "validation.addressRequired"),
  address2: z.string().optional(),
  city: z.string().min(1, "validation.cityRequired"),
  province: z.string().optional(),
  postalCode: z.string().min(1, "validation.postalCodeRequired"),
  country: z.string().min(1, "validation.countryRequired"),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
