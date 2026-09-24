import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { StudioBackdrop } from "@/components/StudioBackdrop";
import { StudioShell } from "@/components/StudioShell";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
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
    <html
      lang="en"
      className={`${dmSans.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-studio-bg text-studio-fg">
        <StudioBackdrop />
        <StudioShell>{children}</StudioShell>
      </body>
    </html>
  );
}
