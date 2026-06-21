import Link from "next/link";
import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Create an account</h1>
        <p className="subtitle">Sign up to get started</p>

        {params.error && (
          <div className="message error">{params.error}</div>
        )}

        <form action={signup}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>
          <button className="primary" type="submit">
            Sign up
          </button>
        </form>

        <div className="alt-action">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
