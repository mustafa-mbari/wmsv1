import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { IntlProvider } from "@/components/providers/intl-provider";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WM-Lab v1 - Warehouse Management Laboratory",
  description: "Modern warehouse management laboratory built with Next.js and shadcn/ui",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <IntlProvider>
          <SettingsProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <QueryProvider>
                <AuthProvider>
                  {children}
                  <Toaster />
                </AuthProvider>
              </QueryProvider>
            </ThemeProvider>
          </SettingsProvider>
        </IntlProvider>
      </body>
    </html>
  );
}