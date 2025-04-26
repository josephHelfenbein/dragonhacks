import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/app/providers/ThemeProvider";
import Script from "next/script";
import { Toaster } from 'sonner'; // Import Toaster

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Focura",
  description: "A study companion that monitors your posture, phone usage, and helps you stay productive",
  icons: {
    icon: '/public/images/focura-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read public env variables on the server
  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors /> {/* Add Toaster here */}
        </ThemeProvider>

        {/* Inject ENV variables for client-side script */}
        <Script id="pusher-env-vars" strategy="beforeInteractive">
          {`
            window.PUSHER_KEY = "${pusherKey}";
            window.PUSHER_CLUSTER = "${pusherCluster}";
          `}
        </Script>

        {/* Load the Pusher library */}
        <Script src="https://js.pusher.com/8.4.0/pusher.min.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
