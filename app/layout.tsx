import type { Metadata } from "next";
import { Fira_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import LayoutWrapper from "@/components/layouts/LayoutWrapper";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const firamono = Fira_Mono({
  weight: ["400", "500", "700"], // Fira Mono available weights
  subsets: ["latin"],
  variable: "--font-firamono",
});
export const metadata: Metadata = {
  title: "GardaChain Auditor Platform",
  description: "Trusted Security. Smarter Audits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getTheme() {
                  const stored = localStorage.getItem('theme');
                  if (stored === 'light' || stored === 'dark') return stored;
                  if (stored === 'system' || !stored) {
                    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  return 'dark';
                }
                const theme = getTheme();
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${jakarta.variable} ${firamono.variable} antialiased`}>
        <ToastContainer />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}

