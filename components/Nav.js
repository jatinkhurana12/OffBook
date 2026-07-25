import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Nav({ session }) {
  return (
    <header className="border-b-2 border-ink bg-paper sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-5 flex items-center justify-between h-16">
        <Link href="/" className="font-display font-bold text-lg tracking-tight">
          OFF<span className="strike">BOOK</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="hover:text-pen">
            Problems
          </Link>
          <Link href="/members" className="hover:text-pen">
            Directory
          </Link>
          {session ? (
            <>
              <Link href="/profile" className="hover:text-pen">
                {session.name.split(" ")[0]}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-pen">
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-ink text-paper px-4 py-2 font-display text-xs uppercase tracking-wider hover:bg-pen transition-colors"
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
