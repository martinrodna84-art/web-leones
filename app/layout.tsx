import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Los Leones del Trail",
  description: "Refactor en Next.js de la web y la Liga Felina de Los Leones del Trail.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
