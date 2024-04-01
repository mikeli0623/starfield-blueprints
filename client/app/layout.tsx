import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";
import "./css/editor.scss";
import { AuthProvider } from "./context/AuthContext";
import Nav from "./components/Nav";
import { Toaster } from "react-hot-toast";
import { DesignsProvider } from "./context/DesignsContext";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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
            <SkeletonTheme baseColor="#c9c9c9" highlightColor="#dbdbdb">
              <Toaster position="bottom-center" />
              <Nav />
              {children}
            </SkeletonTheme>
          </DesignsProvider>
        </AuthProvider>
      </body>
      <link rel="icon" href="/favicon.ico" sizes="any" />
    </html>
  );
}
