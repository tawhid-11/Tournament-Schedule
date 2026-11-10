import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TourneyPro - Tournament Fixture & Match Banner Management System",
  description:
    "Create any tournament format, build groups with drag-and-drop, auto-schedule matches, resolve knockout brackets, and generate social media match banners.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground`}>
        {children}
      </body>
    </html>
  );
}
