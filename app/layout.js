import "./globals.css";
import Nav from "../components/Nav";
import { getSession } from "../lib/auth";

export const metadata = {
  title: "Offbook — built by people the system wrote off",
  description:
    "A community for ambitious high school and college dropouts to trade real problems, find collaborators, and build without a degree.",
};

export default function RootLayout({ children }) {
  const session = getSession();
  return (
    <html lang="en">
      <body className="min-h-screen paper-texture">
        <Nav session={session} />
        <main>{children}</main>
      </body>
    </html>
  );
}
