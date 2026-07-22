import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShowMe — a custom animation for any question",
  description: "Stop reading explanations. Watch one built for you.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
