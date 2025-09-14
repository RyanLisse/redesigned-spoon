import BrowserEchoScript from "@browser-echo/next/BrowserEchoScript";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Image from "next/image";
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
    <html className="dark" lang="en">
      <head>
        {process.env.NODE_ENV === "development" && (
          <BrowserEchoScript route="/api/client-logs" />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#1a1d21] text-white antialiased`}
      >
        <div className="flex h-screen w-full flex-col">
          <header className="flex items-center border-gray-800/50 border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <Image
                alt="HGG logo"
                className="rounded"
                height={40}
                src="/HGG_logo-primair_RGB .webp"
                width={40}
              />
              <span className="font-medium text-lg text-white">
                RoboRail Assistant
              </span>
            </div>
          </header>
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </body>
    </html>
  );
}
