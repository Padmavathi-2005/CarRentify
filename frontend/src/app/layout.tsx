import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarRentify | Premium Car Rental Services",
  description: "Experience the ultimate in mobility with our elite vehicle fleet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
