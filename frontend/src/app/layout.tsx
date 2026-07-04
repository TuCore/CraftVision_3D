import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["vietnamese", "latin"],
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
      className={`${inter.variable} ${plusJakartaSans.variable} antialiased`}
    >
      <body className="min-h-screen font-sans bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
