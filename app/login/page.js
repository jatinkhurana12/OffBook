import Link from "next/link";
import AuthForm from "../../components/AuthForm";

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="font-display text-2xl font-bold mb-2">Welcome back</h1>
      <p className="text-muted text-sm mb-8">Pick up where you left off.</p>
      <AuthForm mode="login" />
      <p className="text-sm text-muted mt-6">
        New here?{" "}
        <Link href="/signup" className="text-pen font-medium">
          Create a profile
        </Link>
      </p>
    </div>
  );
}
