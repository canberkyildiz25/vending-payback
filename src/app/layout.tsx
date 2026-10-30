import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { I18nProvider } from "@/components/I18n";
import { MESSAGES } from "@/lib/i18n";
import { getLang } from "@/lib/lang-server";
import "./globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin", "latin-ext"], axes: ["wdth"] });
const plexSans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"] });

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = MESSAGES[await getLang()];
  return { title: meta.title, description: meta.description };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <I18nProvider lang={lang}>{children}</I18nProvider>
      </body>
    </html>
  );
}
