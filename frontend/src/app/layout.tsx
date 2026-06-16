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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "CarRental | Premium Car Rental Services",
  description: "Experience the ultimate in mobility with our elite vehicle fleet.",
  openGraph: {
    title: "CarRental | Premium Car Rental Services",
    description: "Experience the ultimate in mobility with our elite vehicle fleet.",
    url: "/",
    siteName: "CarRental",
    images: [
      {
        url: "https://carrental.sangvish.com/hero-main.jpg",
        width: 1200,
        height: 630,
        alt: "CarRental Premium Fleet",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CarRental | Premium Car Rental Services",
    description: "Experience the ultimate in mobility with our elite vehicle fleet.",
    images: ["https://carrental.sangvish.com/hero-main.jpg"],
  },
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
 <script
   dangerouslySetInnerHTML={{
     __html: `
       (function() {
         try {
           var theme = localStorage.getItem('theme') || 'light';
           var primary = localStorage.getItem('primaryColor');
           var secondary = localStorage.getItem('secondaryColor');
           var root = document.documentElement;
           
           if (theme === 'dark') root.classList.add('dark');
           
           function hexToHSL(hex) {
             if (!hex || hex.length !== 7) return null;
             var r = parseInt(hex.substring(1,3), 16)/255;
             var g = parseInt(hex.substring(3,5), 16)/255;
             var b = parseInt(hex.substring(5,7), 16)/255;
             var max = Math.max(r,g,b), min = Math.min(r,g,b);
             var h = 0, s = 0, l = (max + min) / 2;
             if (max !== min) {
               var d = max - min;
               s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
               switch (max) {
                 case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                 case g: h = (b - r) / d + 2; break;
                 case b: h = (r - g) / d + 4; break;
               }
               h /= 6;
             }
             return Math.round(h*360) + " " + Math.round(s*100) + "% " + Math.round(l*100) + "%";
           }
           
           if (primary) {
             root.style.setProperty('--primary-brand-color', primary);
             var hsl = hexToHSL(primary);
             if (hsl) root.style.setProperty('--primary', hsl);
           }
           if (secondary) {
             root.style.setProperty('--secondary-brand-color', secondary);
             var hsl = hexToHSL(secondary);
             if (hsl) root.style.setProperty('--primary-hover', hsl);
           }
         } catch (e) {}
       })();
     `,
   }}
 />
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
