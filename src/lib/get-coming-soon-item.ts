import { comingSoonNav, type NavItem } from "@/lib/navigation";

export function getComingSoonItem(href: string): NavItem | undefined {
  return comingSoonNav.find((item) => item.href === href);
}
