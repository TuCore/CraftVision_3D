import type { Metadata } from "next";
import { Poppins, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Toaster } from "@/components/ui/sonner";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@/components/ThemeProvider";

import { LanguageProvider } from "@/components/LanguageProvider";
import QueryProvider from "@/providers/QueryProvider";
const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["vietnamese", "latin"],
});

export const metadata: Metadata = {
  title: "CraftVision3D — Trợ lý AI cho quà tặng thủ công",
  description: "Tạo món quà thủ công đầy ý nghĩa với AI: ý tưởng, nguyên liệu, chi phí và video hướng dẫn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html
      lang="vi"
      className={`${poppins.variable} ${plusJakartaSans.variable} antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-screen font-sans bg-background text-foreground overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <LanguageProvider>
              <GoogleOAuthProvider clientId={googleClientId}>
                <CartProvider>
                  {children}
                  <Toaster position="top-center" />
                </CartProvider>
              </GoogleOAuthProvider>
            </LanguageProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
