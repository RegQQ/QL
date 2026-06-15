import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vionix | Enterprise AI Risk Management",
  description: "Visibility, accountability, and risk management for enterprise AI usage."
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
