import type { Metadata } from "next";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mangaflow.vercel.app"),
  title: {
    default: "MangaFlow — leitura de mangás",
    template: "%s | MangaFlow"
  },
  description:
    "MangaFlow é uma plataforma dark mode para descobrir, favoritar e ler mangás online.",
  openGraph: {
    title: "MangaFlow",
    description: "Plataforma de leitura de mangás com Supabase Auth e leitor responsivo.",
    type: "website"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-background">
          Pular para o conteúdo
        </a>
        <Navbar />
        <main id="conteudo" className="min-h-screen pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
