import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { StudioShell } from "@/components/StudioShell";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Studio",
    template: "%s · Studio",
  },
  description:
    "A small creative studio: pick an effect or start blank, generate, save to your library, and remix.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-studio-bg text-studio-fg">
        <StudioShell>{children}</StudioShell>
      </body>
    </html>
  );
}
