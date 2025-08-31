import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shivamtrix Background Remover",
  description: "Remove and change image backgrounds instantly with AI-powered precision.",
  keywords: [
    "background remover",
    "remove background",
    "AI photo editor",
    "image editing",
    "transparent background",
    "online background remover"
  ],
  authors: [{ name: "Shivamtrix", url: "https://background-remover.itshivam.in" }],
  metadataBase: new URL("https://background-remover.itshivam.in"),
  alternates: {
    canonical: "https://background-remover.itshivam.in",
  },
  openGraph: {
    title: "Shivamtrix Background Remover",
    description: "Fast and free AI background remover. Upload your photo and get a clean cutout in seconds.",
    url: "https://background-remover.itshivam.in",
    siteName: "Shivamtrix Background Remover",
    images: [
      {
        url: "https://background-remover.itshivam.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shivamtrix Background Remover Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shivamtrix Background Remover",
    description: "Remove and replace image backgrounds online — quick, accurate, free.",
    images: ["https://background-remover.itshivam.in/og-image.png"],
    creator: "@shivamtrix", 
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://background-remover.itshivam.in" />
      </head>
      <body className="min-h-screen bg-[#0C0D10] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
