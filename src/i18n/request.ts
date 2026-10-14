import { getRequestConfig } from "next-intl/server";
import { isAppLocale, routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isAppLocale(requested) ? requested : routing.defaultLocale;

  return {
    locale,
    // Fixed zone so server- and client-rendered dates agree (no hydration drift).
    timeZone: "Europe/Riga",
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
