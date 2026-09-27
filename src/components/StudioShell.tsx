"use client";

import { Suspense } from "react";
import Link from "next/link";
import { HiggsfieldApiKeyPanel } from "@/components/HiggsfieldApiKeyPanel";
import { HiggsfieldApiKeyProvider } from "@/components/HiggsfieldApiKeyProvider";
import { StudioCreateProvider } from "@/components/StudioCreateProvider";
import { MoreNavMenu } from "@/components/MoreNavMenu";
import {
  SidebarCollapseIcon,
  SidebarNavIcon,
} from "@/components/StudioSidebarIcons";
import { useHydratedPathname } from "@/hooks/use-hydrated-pathname";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { liveNav } from "@/lib/navigation";

function sidebarLinkClass(isActive: boolean, collapsed: boolean) {
  return [
    "studio-btn-nav",
    collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
    isActive ? "studio-btn-nav--active" : "",
  ].join(" ");
}

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = useHydratedPathname();
  const { collapsed, toggleCollapsed, ready } = useSidebarCollapsed();

  const sidebarWidth = collapsed ? "w-[4.25rem]" : "w-[15.5rem]";

  return (
    <HiggsfieldApiKeyProvider>
      <div className="flex min-h-full">
        <aside
          className={[
            "studio-sidebar-enter sticky top-0 z-50 flex h-screen shrink-0 flex-col border-r border-studio-border-subtle bg-white/95 backdrop-blur-sm transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            sidebarWidth,
            ready ? "" : "w-[15.5rem]",
          ].join(" ")}
          aria-label="Studio navigation"
          data-collapsed={collapsed ? "true" : "false"}
        >
          <div
            className={[
              "flex flex-col gap-5 py-5",
              collapsed ? "px-2" : "px-3",
            ].join(" ")}
          >
            <div
              className={[
                "flex items-center",
                collapsed ? "flex-col gap-2" : "justify-between gap-2 px-1",
              ].join(" ")}
            >
              <Link
                href="/"
                title="Studio home"
                className={[
                  "group flex min-w-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900",
                  collapsed ? "justify-center" : "gap-2.5",
                ].join(" ")}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 text-sm font-bold text-white shadow-sm ring-2 ring-white"
                  aria-hidden
                >
                  H
                </span>
                <span
                  className={[
                    "studio-display truncate text-lg font-semibold tracking-tight text-studio-fg transition-all duration-300 group-hover:text-zinc-700",
                    collapsed
                      ? "pointer-events-none w-0 overflow-hidden opacity-0"
                      : "opacity-100",
                  ].join(" ")}
                >
                  Studio
                </span>
              </Link>

              <button
                type="button"
                onClick={toggleCollapsed}
                className={[
                  "studio-btn-icon p-2",
                  collapsed ? "w-full" : "shrink-0",
                ].join(" ")}
                aria-expanded={!collapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <SidebarCollapseIcon collapsed={collapsed} />
              </button>
            </div>

            <nav aria-label="Main">
              <ul className="flex flex-col gap-0.5">
                {liveNav.map((item) => {
                  const isActive =
                    pathname !== null &&
                    (item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={sidebarLinkClass(isActive, collapsed)}
                      >
                        <SidebarNavIcon href={item.href} active={isActive} />
                        <span
                          className={[
                            "truncate transition-all duration-300",
                            collapsed
                              ? "pointer-events-none w-0 overflow-hidden opacity-0"
                              : "opacity-100",
                          ].join(" ")}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
                <li className={collapsed ? "" : "pt-1"}>
                  <MoreNavMenu
                    variant="sidebar"
                    collapsed={collapsed}
                    key={pathname ?? "ssr"}
                  />
                </li>
              </ul>
            </nav>
          </div>

          <div
            className={[
              "mt-auto border-t border-studio-border-subtle py-4",
              collapsed ? "px-2" : "px-3",
            ].join(" ")}
          >
            <HiggsfieldApiKeyPanel
              variant="sidebar"
              collapsed={collapsed}
              dropDirection="up"
            />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <main className="relative z-0 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
            <Suspense fallback={null}>
              <StudioCreateProvider>{children}</StudioCreateProvider>
            </Suspense>
          </main>

        </div>
      </div>
    </HiggsfieldApiKeyProvider>
  );
}
