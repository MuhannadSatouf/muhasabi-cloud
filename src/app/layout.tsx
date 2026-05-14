import { cookies } from "next/headers";
import Script from "next/script";

import { AuthSessionProvider } from "../components/providers/session-provider";
import { fontArabic, fontMono, fontSans } from "../lib/fonts";
import { THEME_STORAGE_KEY } from "../lib/theme-storage";

import "./globals.css";

const themeInitScript = `(()=>{try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="dark")document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark");}catch(e){}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("muhasabi-locale")?.value;
  const locale = raw === "ar" ? "ar" : "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontArabic.variable} ${fontMono.variable}`}
    >
      <body suppressHydrationWarning>
        <Script
          id="muhasabi-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
