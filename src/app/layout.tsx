import type { Metadata } from "next";
import { themeStyle } from "@/design/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Starrboard · Your command center",
  description: "Your private personal command center.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={themeStyle}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
