import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SafeLife AI — Care & Security for Senior Citizens (सीनियर सिटीजन केयर और सुरक्षा)",
  description: "Simple AI assistant to explain medical reports in simple Hindi/English mix and analyze suspicious messages or calls for potential fraud. (सीनियर सिटीजन्स के लिए मेडिकल रिपोर्ट समझाने और फ्रॉड मैसेज पहचानने वाला मददगार एआई सहायक।)",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${outfit.variable} font-sans min-h-full bg-slate-950 text-slate-100 antialiased`}>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
