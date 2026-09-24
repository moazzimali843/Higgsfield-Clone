export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

/** Primary studio areas that ship in Phases 3–6+ */
export const liveNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Effects", href: "/effects" },
  { label: "Image", href: "/image" },
  { label: "Video", href: "/video" },
  { label: "Library", href: "/library" },
];

/** Wider Higgsfield map — honest Coming soon pages until later phases */
export const comingSoonNav: NavItem[] = [
  {
    label: "Audio",
    href: "/audio",
    description: "Speech and sound tools on higgsfield.ai. Not in this assignment.",
  },
  {
    label: "3D",
    href: "/3d",
    description: "3D generation surface. Not in this assignment.",
  },
  {
    label: "Edit",
    href: "/edit",
    description: "Dedicated edit workflows. Not in this assignment.",
  },
  {
    label: "Cinema Studio",
    href: "/cinema-studio",
    description: "Professional cinema product. Coming soon.",
  },
  {
    label: "Marketing Studio",
    href: "/marketing-studio",
    description: "Marketing and ad loops. Coming soon.",
  },
  {
    label: "Supercomputer",
    href: "/supercomputer",
    description: "Agentic research loops. Coming soon.",
  },
  {
    label: "Contests",
    href: "/contests",
    description: "Community contests. Coming soon.",
  },
  {
    label: "Community",
    href: "/community",
    description: "Feeds and galleries. Coming soon.",
  },
  {
    label: "Canvas",
    href: "/canvas",
    description: "Canvas workspace. Coming soon.",
  },
  {
    label: "MCP",
    href: "/mcp",
    description: "Model Context Protocol developer surface. Coming soon.",
  },
];
