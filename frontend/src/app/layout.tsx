import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Five Factions",
  description: "Build the qualities that matter to you through thoughtful weekly challenges.",
  icons: { icon: "/artwork/factions-logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sl"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
