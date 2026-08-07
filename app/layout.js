import "./globals.css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import { getSession } from "../lib/auth";
import { query } from "../lib/db";
import ScrollProgress from "../components/ScrollProgress";
import CursorGlow from "../components/CursorGlow";

export const metadata = {
  title: "Offbook — built by people the system wrote off",
  description:
    "A community for ambitious high school and college dropouts to trade real problems, find collaborators, and build without a degree.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Offbook",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#080B14",
};

export default async function RootLayout({ children }) {
  const session = getSession();

  // Fetched here (once, server-side) so the header can show the profile
  // picture without every page having to know about it.
  let avatarUrl = "";
  if (session) {
    const result = await query("SELECT avatar_url FROM profiles WHERE user_id = $1", [session.id]);
    avatarUrl = result.rows[0]?.avatar_url || "";
  }

  return (
<html lang="en" className="scroll-smooth">
        <body className="min-h-screen paper-texture flex flex-col overflow-x-hidden">
        <ScrollProgress />
        <CursorGlow />
        <Nav session={session} avatarUrl={avatarUrl} />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}