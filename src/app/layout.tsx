import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
  title: "OnePWS pvt ltd",
  description: "Secure policy document portal",
  icons: {
    icon: "/uploads/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-be-vietnam-pro">
        {children}
      </body>
    </html>
  );
}
