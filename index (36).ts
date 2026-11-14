import fr from "./fr.json";
import en from "./en.json";

export type Locale = "fr" | "en";
export type Messages = typeof fr;
const dictionaries: Record<Locale, Messages> = { fr, en };

export function getMessages(locale: Locale = "fr"): Messages {
  return dictionaries[locale] ?? fr;
}
