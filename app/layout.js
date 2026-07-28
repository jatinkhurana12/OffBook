import "./globals.css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { getSession } from "../lib/auth";
import { query } from "../lib/db";

export const metadata = {
  title: "Offbook — built by people the system wrote off",
  description:
    "A community for ambitious high school and college dropouts to trade real problems, find collaborators, and build without a degree.",
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
    <html lang="en">
      <body className="min-h-screen paper-texture flex flex-col">
        <Nav session={session} avatarUrl={avatarUrl} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}