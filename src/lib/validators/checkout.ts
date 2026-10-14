import { z } from "zod";

// Error messages are stable i18n keys (namespace "validation"). Forms render
// them via useValidationMessage(); API routes may surface them as-is.

export const checkoutContactSchema = z.object({
  email: z.string().email("validation.emailInvalid"),
  phone: z.string().optional(),
});

export const checkoutShippingSchema = z.object({
  firstName: z.string().min(1, "validation.firstNameRequired"),
  lastName: z.string().min(1, "validation.lastNameRequired"),
  address1: z.string().min(1, "validation.addressRequired"),
  address2: z.string().optional(),
  city: z.string().min(1, "validation.cityRequired"),
  province: z.string().optional(),
  postalCode: z.string().min(1, "validation.postalCodeRequired"),
  country: z.string().min(1, "validation.countryRequired"),
});

export const cardSchema = z.object({
  number: z.string().min(13, "validation.cardNumberTooShort").max(19, "validation.cardNumberTooLong").refine((val) => {
    const clean = val.replace(/\s+/g, "");
    const isVisa = /^4/.test(clean);
    const isMaster = /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(clean);
    return isVisa || isMaster;
  }, "validation.cardUnsupported"),
  holder: z.string().min(1, "validation.cardHolderRequired"),
  expiryMonth: z.string().length(2, "validation.expiryMonthFormat"),
  expiryYear: z.string().length(4, "validation.expiryYearFormat"),
  cvv: z.string().min(3, "validation.cvvTooShort").max(4, "validation.cvvTooLong"),
});

export const checkoutSchema = z.object({
  contact: checkoutContactSchema,
  shipping: checkoutShippingSchema,
  shippingMethod: z.string().min(1, "validation.shippingMethodRequired"),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
