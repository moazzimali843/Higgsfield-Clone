import type { ReactNode } from "react";

type IconProps = {
  className?: string;
  active?: boolean;
};

const base =
  "shrink-0 transition-colors duration-200";

export function SidebarHomeIcon({ className, active }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={[base, className].filter(Boolean).join(" ")}
    >
      <path
        d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19v-8.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 20.5V14a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {active ? (
        <circle cx="12" cy="11" r="1" fill="currentColor" className="opacity-80" />
      ) : null}
    </svg>
  );
}

export function SidebarImageIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={[base, className].filter(Boolean).join(" ")}
    >
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="8.5" cy="10.5" r="1.75" fill="currentColor" className="opacity-90" />
      <path
        d="M3.5 15.5 9 11l3.5 2.5L15.5 11l5.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SidebarVideoIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={[base, className].filter(Boolean).join(" ")}
    >
      <path
        d="M4.5 7.5A1.5 1.5 0 0 1 6 6h8.5A1.5 1.5 0 0 1 16 7.5v9A1.5 1.5 0 0 1 14.5 18H6A1.5 1.5 0 0 1 4.5 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M16 10.2 20.5 8v8l-4.5-2.2v-3.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
    </svg>
  );
}

export function SidebarLibraryIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={[base, className].filter(Boolean).join(" ")}
    >
      <path
        d="M5 5.5h5.5v13H6.5A1.5 1.5 0 0 1 5 17V5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 5.5H16v13h-4A1.5 1.5 0 0 1 10.5 17V5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 8.5h2.5A1.5 1.5 0 0 1 20 10v8.5h-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SidebarMoreIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={[base, className].filter(Boolean).join(" ")}
    >
      <rect x="4" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect
        x="13"
        y="13"
        width="7"
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        className="opacity-75"
      />
    </svg>
  );
}

export function SidebarKeyIcon({ className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={[base, className].filter(Boolean).join(" ")}
    >
      <circle cx="8.5" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 12h8m-3-3 3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="12" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function SidebarCollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 text-studio-muted"
    >
      {collapsed ? (
        <>
          <rect
            x="4"
            y="5"
            width="16"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M9.5 8v8M13 12h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <rect
            x="4"
            y="5"
            width="16"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M9.5 8v8M13 12H7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export function SidebarTrashIcon({ className }: IconProps) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={[base, className].filter(Boolean).join(" ")}
    >
      <path
        d="M9.5 3.5h5l.5 2h5.5v2H3V5.5h5.5l.5-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M6 9.5v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 12v6M14 12v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navIconByHref: Record<string, (props: IconProps) => ReactNode> = {
  "/": SidebarHomeIcon,
  "/image": SidebarImageIcon,
  "/video": SidebarVideoIcon,
  "/library": SidebarLibraryIcon,
};

export function SidebarNavIcon({ href, active }: { href: string; active: boolean }) {
  const Icon = navIconByHref[href] ?? SidebarMoreIcon;
  return <Icon active={active} />;
}
