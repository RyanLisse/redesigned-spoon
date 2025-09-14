import type { Metadata } from "next";
import localFont from "next/font/local";
import Image from "next/image";
import BrowserEchoScript from "@browser-echo/next/BrowserEchoScript";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "RoboRail Assistant",
  description: "Conversational assistant with file-grounded answers",
  icons: {
    icon: "/openai_logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {process.env.NODE_ENV === "development" && (
          <BrowserEchoScript route="/api/client-logs" />
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0d0f12] text-foreground`}>
        <div className="flex h-screen w-full flex-col">
          <header className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Image src="/hgg-logo.png" alt="HGG logo" width={24} height={24} />
              <span className="font-medium">RoboRail Assistant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {/* Right-side actions can be added here later */}
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
