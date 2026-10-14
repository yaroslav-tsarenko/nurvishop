import { notFound } from "next/navigation";

// Unknown URLs under a locale render the localized [locale]/not-found page
// instead of Next's bare default 404.
export default function CatchAllPage() {
  notFound();
}
