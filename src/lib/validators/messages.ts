import { useCallback } from "react";
import { useTranslations } from "next-intl";

const PREFIX = "validation.";

/**
 * Zod schemas in this folder use i18n keys ("validation.emailInvalid") as
 * their error messages so they stay usable in API routes. Forms call the
 * returned function to render the localized text; unknown messages are
 * returned unchanged.
 */
export function useValidationMessage() {
  const t = useTranslations("validation");
  return useCallback(
    (message?: string): string | undefined => {
      if (!message) return undefined;
      if (message.startsWith(PREFIX)) {
        const key = message.slice(PREFIX.length);
        if (t.has(key)) return t(key);
      }
      return message;
    },
    [t],
  );
}
