import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seed — build worlds in the clouds",
  description: "A browser-based 3D game builder: paint worlds, place objects, wire logic with 3D blocks, then hit play.",
  openGraph: {
    title: "Seed — build worlds in the clouds",
    description: "A browser-based 3D game builder: paint worlds, place objects, wire logic with 3D blocks, then hit play.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seed — build worlds in the clouds",
    description: "A browser-based 3D game builder: paint worlds, place objects, wire logic with 3D blocks, then hit play.",
  },
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
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
