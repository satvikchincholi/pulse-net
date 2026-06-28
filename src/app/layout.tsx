import "./globals.css";
import { PropsWithChildren } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import PulseBot from "@/components/PulseBot";

export const metadata = {
  title: "PulseNet – Civic Intelligence",
  description: "Secure dashboard for reporting community infrastructure issues",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.theme === 'light') {
              document.documentElement.classList.remove('dark');
            } else {
              document.documentElement.classList.add('dark');
            }
          } catch (_) {}
        `}} />
      </head>
      <body
        className="bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-850 min-h-screen text-slate-900 dark:text-white transition-colors duration-300"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
            <PulseBot />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
