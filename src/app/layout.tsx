import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Clínica Médica - Sistema de Gestão",
  description: "Sistema completo de gestão para consultórios médicos",
  keywords: ["Clínica", "Médica", "Gestão", "Consultório", "Saúde"],
  authors: [{ name: "Clínica Médica" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Clínica Médica - Sistema de Gestão",
    description: "Sistema completo de gestão para consultórios médicos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clínica Médica - Sistema de Gestão",
    description: "Sistema completo de gestão para consultórios médicos",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className="antialiased bg-background text-foreground"
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
