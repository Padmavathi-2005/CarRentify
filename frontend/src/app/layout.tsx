import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthContext";
import { LocaleProvider } from "@/components/LocaleContext";
import { SocketProvider } from "@/components/SocketProvider";
import { ToastProvider } from "@/components/Toast";

const outfit = Outfit({
 variable: "--font-outfit",
 subsets: ["latin"],
 weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
 title: "CarRental | Premium Car Rental Services",
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
 className={`${outfit.variable} h-full antialiased`}
 >
 <head>
 <link rel="preload" href="/logo.png" as="image" />
 <link rel="preload" href="/images/site/car-bg.png" as="image" />
 </head>
 <body className="min-h-full font-sans" suppressHydrationWarning>
 <ToastProvider>
 <LocaleProvider>
 <AuthProvider>
 <SocketProvider>
 <ThemeProvider>
 {children}
 </ThemeProvider>
 </SocketProvider>
 </AuthProvider>
 </LocaleProvider>
 </ToastProvider>
 </body>
 </html>
 );
}
