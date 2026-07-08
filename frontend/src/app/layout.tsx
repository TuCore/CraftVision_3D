import type { Metadata } from "next";
import { Poppins, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Toaster } from "@/components/ui/sonner";

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
  return (
    <html
      lang="vi"
      className={`${poppins.variable} ${plusJakartaSans.variable} antialiased`}
    >
      <body className="min-h-screen font-sans bg-background text-foreground overflow-x-hidden">
        <CartProvider>
          {children}
          <Toaster position="top-center" />
        </CartProvider>
      </body>
    </html>
  );
}
