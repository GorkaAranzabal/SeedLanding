import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seed",
  description: "Next-generation tactical autonomous drone system.",
  icons: {
    icon: '/images/IconSmall.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
