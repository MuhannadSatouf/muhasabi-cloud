import { cookies } from "next/headers";

import { AuthSessionProvider } from "../components/providers/session-provider";
import { fontArabic, fontMono, fontSans } from "../lib/fonts";

import "./globals.css";

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
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
