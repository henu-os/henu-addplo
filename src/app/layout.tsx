import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { Shell } from "@/components/layout/Shell";

export const metadata: Metadata = {
  title: "HENU Admin Panel | Ecosystem Operations & Release Hub",
  description:
    "Authoritative administrative control center for HENU OS applications, releases and distribution catalogue.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
