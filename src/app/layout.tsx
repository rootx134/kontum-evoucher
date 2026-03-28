import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "E-Voucher Kon Tum + | Tri ân Fan cứng",
  description: "Trải nghiệm những ưu đãi tuyệt vời từ các đối tác của Kon Tum +",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} min-h-screen antialiased overflow-x-hidden`}>{children}</body>
    </html>
  );
}
