import {headers} from "next/headers";
import {LOCALES,localePath} from "@/lib/locales";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import Script from "next/script";
import "./globals.css";
import "./studio.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

import { Playfair_Display } from "next/font/google";
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const baseMetadata: Metadata = {
  title: "Descobreix",
  description: "Descobreix el portfolio de Marc G. - Disseny, Estratègia i Producte.",
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};


export async function generateMetadata(): Promise<Metadata> {
 const requestHeaders = await headers();
 const path = requestHeaders.get("x-descobreix-path") || "/";
 const locale = await getLocale();
 if (path.startsWith("/admin") || /^\/v\/(?!preview(?:\/|$))/.test(path)) return {...baseMetadata,robots:{index:false,follow:false}};
 const root = "https://descobreix.com";
 return {...baseMetadata,alternates:{canonical:root+localePath(locale,path),languages:Object.fromEntries([...LOCALES.map(code=>[code,root+localePath(code,path)]),["x-default",root+localePath("ca",path)]])}};
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">

      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('studio-theme')||localStorage.getItem('theme');if(t==='dark'){document.documentElement.dataset.studioTheme='dark';document.documentElement.classList.remove('light')}else if(t==='light'){document.documentElement.dataset.studioTheme='light';document.documentElement.classList.add('light')}}catch(_){}`,
          }}
        />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} ${playfair.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

