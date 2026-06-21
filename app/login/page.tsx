import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">Log in to your account</p>

        {params.error && (
          <div className="message error">{params.error}</div>
        )}
        {params.success && (
          <div className="message success">{params.success}</div>
        )}

        <form action={login}>
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
              placeholder="Your password"
            />
          </div>
          <button className="primary" type="submit">
            Log in
          </button>
        </form>

        <div className="alt-action">
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
