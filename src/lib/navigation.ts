export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

/** Primary studio areas that ship in Phases 3–4+ */
export const liveNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Effects", href: "/effects" },
  { label: "Image", href: "/image" },
  { label: "Library", href: "/library" },
];

/** Wider Higgsfield map — honest Coming soon pages until later phases */
export const comingSoonNav: NavItem[] = [
  {
    label: "Video",
    href: "/video",
    description: "Same compose → generate loop as image (Phase 6).",
  },
  {
    label: "Audio",
    href: "/audio",
    description: "Speech and sound tools on higgsfield.ai — not in this assignment.",
  },
  {
    label: "3D",
    href: "/3d",
    description: "3D generation surface — not in this assignment.",
  },
  {
    label: "Edit",
    href: "/edit",
    description: "Dedicated edit workflows — not in this assignment.",
  },
  {
    label: "Cinema Studio",
    href: "/cinema-studio",
    description: "Professional cinema product — Coming soon.",
  },
  {
    label: "Marketing Studio",
    href: "/marketing-studio",
    description: "Marketing and ad loops — Coming soon.",
  },
  {
    label: "Supercomputer",
    href: "/supercomputer",
    description: "Agentic research loops — Coming soon.",
  },
  {
    label: "Contests",
    href: "/contests",
    description: "Community contests — Coming soon.",
  },
  {
    label: "Community",
    href: "/community",
    description: "Feeds and galleries — Coming soon.",
  },
  {
    label: "Canvas",
    href: "/canvas",
    description: "Canvas workspace — Coming soon.",
  },
  {
    label: "MCP",
    href: "/mcp",
    description: "Model Context Protocol developer surface — Coming soon.",
  },
];
