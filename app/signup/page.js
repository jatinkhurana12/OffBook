import Link from "next/link";
import AuthForm from "../../components/AuthForm";

export default function SignupPage() {
  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="font-display text-2xl font-bold mb-2">Create your profile</h1>
      <p className="text-muted text-sm mb-8">No degree required. Just a problem you care about.</p>
      <AuthForm mode="signup" />
      <p className="text-sm text-muted mt-6">
        Already in the room?{" "}
        <Link href="/login" className="text-pen font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
