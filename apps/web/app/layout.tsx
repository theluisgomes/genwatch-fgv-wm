import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GenWatch · Wisemetrics × FGV",
  description: "Inteligência geracional em educação",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.variable}>
        <div className="min-h-screen">
          <header className="border-b border-white/5 px-8 py-5 flex items-center justify-between">
            <div>
              <p className="eyebrow">Wisemetrics × FGV</p>
              <h1 className="font-display text-2xl">GenWatch</h1>
            </div>
            <nav className="flex gap-4 text-sm text-muted">
              <Link href="/" className="hover:text-foreground">Visão Geral</Link>
              <Link href="/regions" className="hover:text-foreground">Regional</Link>
              <Link href="/reports" className="hover:text-foreground">Relatórios</Link>
              <Link href="/admin" className="hover:text-foreground">Admin</Link>
            </nav>
          </header>
          <main className="px-8 py-10">{children}</main>
          <footer className="border-t border-white/5 px-8 py-6 text-xs text-muted flex justify-between">
            <span className="font-display italic">Wisemetrics.</span>
            <span>Inteligência Geracional em Educação · MVP para FGV</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
