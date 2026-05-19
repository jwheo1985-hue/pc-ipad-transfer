"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Password is wrong.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="shell compact">
      <section className="panel">
        <h1>Personal Transfer</h1>
        <form className="stack" onSubmit={submit}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            autoComplete="current-password"
            autoFocus
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          {error ? <p className="error">{error}</p> : null}
          <button disabled={loading || !password} type="submit">
            {loading ? "Checking..." : "Open"}
          </button>
        </form>
      </section>
    </main>
  );
}
