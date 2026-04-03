import type { Metadata } from "next";
import "./globals.css";
import { arboriaBook, arboriaLight, teko } from "@/lib/fonts";

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
    <html lang="es" className={`${teko.variable} ${arboriaBook.variable} ${arboriaLight.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
