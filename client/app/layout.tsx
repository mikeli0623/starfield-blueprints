import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Nav from "./components/Nav";
import { Toaster } from "react-hot-toast";
import { DesignsProvider } from "./context/DesignsContext";

const orb = Orbitron({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Starfield Ship Blueprints",
  description: "View and share starship blueprints from the community",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={orb.className}>
        <AuthProvider>
          <DesignsProvider>
            <Toaster position="bottom-center" />
            <Nav />
            {children}
          </DesignsProvider>
        </AuthProvider>
      </body>
      <link rel="icon" href="/favicon.ico" sizes="any" />
    </html>
  );
}
