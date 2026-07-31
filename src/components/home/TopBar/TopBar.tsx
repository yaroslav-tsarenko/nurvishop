"use client";

import { Link } from "@/i18n/routing";
import { MapPin, Phone, Globe, Info, HelpCircle, Truck, RotateCcw, CreditCard, Package } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  MapPin, Phone, Globe, Info, HelpCircle, Truck, RotateCcw, CreditCard, Package,
};

interface UtilityLink {
  id: string;
  label: string;
  linkUrl: string;
  icon?: string | null;
  position: string;
}

interface Props {
  links: UtilityLink[];
}

const defaultLinks: UtilityLink[] = [
  { id: "1", label: "About", linkUrl: "/about", position: "left" },
  { id: "2", label: "Payment", linkUrl: "/policies/payment", position: "left" },
  { id: "4", label: "Returns", linkUrl: "/policies/returns", position: "left" },
  { id: "5", label: "Warranty", linkUrl: "/policies/warranty", position: "left" },
  { id: "7", label: "Contacts", linkUrl: "/contact", icon: "Phone", position: "right" },
];

export function TopBar({ links }: Props) {
  const items = links.length > 0 ? links : defaultLinks;
  const leftLinks = items.filter((l) => l.position === "left");
  const rightLinks = items.filter((l) => l.position === "right");

  const linkClass =
    "flex items-center gap-1 whitespace-nowrap text-inverse-muted no-underline transition-colors duration-200 hover:text-inverse-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

  return (
    <div className="hidden border-b border-inverse-border bg-inverse text-xs text-inverse-muted md:block">
      <div className="mx-auto flex h-8 max-w-[1400px] items-center justify-between px-4">
        <nav className="flex items-center gap-4">
          {leftLinks.map((link) => {
            const Icon = link.icon ? ICON_MAP[link.icon] : null;
            return (
              <Link key={link.id} href={link.linkUrl} className={linkClass}>
                {Icon && <Icon size={13} />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          {rightLinks.map((link) => {
            const Icon = link.icon ? ICON_MAP[link.icon] : null;
            return (
              <Link key={link.id} href={link.linkUrl} className={linkClass}>
                {Icon && <Icon size={13} />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
