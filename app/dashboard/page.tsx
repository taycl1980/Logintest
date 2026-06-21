import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="dashboard">
      <h1>You&apos;re logged in 🎉</h1>
      <p>
        Signed in as <strong>{user.email}</strong>
      </p>
      <form action={signOut}>
        <button className="secondary" type="submit">
          Sign out
        </button>
      </form>
    </div>
  );
}
