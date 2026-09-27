export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

/** Primary studio areas that ship in Phases 3–6+ */
export const liveNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Image", href: "/image" },
  { label: "Video", href: "/video" },
  { label: "Library", href: "/library" },
];

export const comingSoonNav: NavItem[] = [
  { label: "Audio", href: "/audio", description: "Speech and sound tools." },
  { label: "3D", href: "/3d", description: "3D generation." },
  { label: "Edit", href: "/edit", description: "Edit workflows." },
  { label: "Cinema Studio", href: "/cinema-studio", description: "Cinema tools." },
  {
    label: "Marketing Studio",
    href: "/marketing-studio",
    description: "Marketing and ads.",
  },
  { label: "Supercomputer", href: "/supercomputer", description: "Research agents." },
  { label: "Contests", href: "/contests", description: "Community contests." },
  { label: "Community", href: "/community", description: "Feeds and galleries." },
  { label: "Canvas", href: "/canvas", description: "Canvas workspace." },
  { label: "MCP", href: "/mcp", description: "Developer integrations." },
];

export function isComingSoonHref(href: string): boolean {
  return comingSoonNav.some((item) => item.href === href);
}
