import localFont from "next/font/local";
import { Teko } from "next/font/google";

export const teko = Teko({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-teko",
});

export const arboriaBook = localFont({
  src: "../public/assets/fonts/Arboria-Book.ttf",
  display: "swap",
  variable: "--font-arboria-book",
});

export const arboriaLight = localFont({
  src: "../public/assets/fonts/Arboria-Light.ttf",
  display: "swap",
  variable: "--font-arboria-light",
});
