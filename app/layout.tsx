import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QL Trade | Automation Trade Bot",
  description: "Telegram-gated access for the QL Trade automation trading bot."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
