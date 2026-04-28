import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tu Guia de Indicadores de Trading | Scalping TSLA",
  description: "Aprende a leer indicadores de trading como un profesional. Guia completa de ADX, RSI, MACD, Estocastico, EMA y MA para scalping en TSLA.",
  keywords: ["trading", "indicadores", "scalping", "TSLA", "Webull", "ADX", "RSI", "MACD"],
  authors: [{ name: "Trading Academy" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Tu Guia de Indicadores de Trading",
    description: "Aprende a leer indicadores como un profesional",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#0D1117', color: '#E6EDF3' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
