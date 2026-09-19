import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LiveCode — Real-time Collaborative Editor",
  description:
    "Real-time collaborative code editing with Monaco Editor, Yjs CRDTs, and Liveblocks WebSockets.",
  openGraph: {
    title: "LiveCode",
    description: "Real-time collaborative code editing",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
