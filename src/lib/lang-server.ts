import "server-only";
import { cookies, headers } from "next/headers";
import { LANG_COOKIE, pickLang, type Lang } from "./i18n";

/** The visitor's language: their own choice, else their country from the IP (Vercel), else the browser. */
export async function getLang(): Promise<Lang> {
  const [c, h] = await Promise.all([cookies(), headers()]);
  return pickLang({
    cookie: c.get(LANG_COOKIE)?.value,
    country: h.get("x-vercel-ip-country"),
    acceptLanguage: h.get("accept-language"),
  });
}
