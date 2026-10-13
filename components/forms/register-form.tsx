"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type Props = {
  token: string;
  defaults: { name: string; email: string };
};

export function RegisterForm({ token, defaults }: Props) {
  const [name, setName] = useState(defaults.name);
  const [email, setEmail] = useState(defaults.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // after signup, they land back on the form page
  const callbackURL = `/client/form/${token}`;

  function handleGoogle() {
    authClient.signIn.social({ provider: "google", callbackURL });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL,
    });

    if (error) setError(error.message ?? "Something went wrong");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Hi {defaults.name.split(" ")[0]}, create your account
      </h1>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full rounded border px-4 py-2"
      >
        Continue with Google
      </button>

      <div className="text-center text-sm opacity-60">or</div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full rounded border px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />
        <input
          className="w-full rounded border px-3 py-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          className="w-full rounded border px-3 py-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full rounded bg-black px-4 py-2 text-white">
          Create account
        </button>
      </form>
    </div>
  );
}