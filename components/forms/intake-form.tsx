"use client";

import { useState } from "react";

type Props = {
  token: string;
  defaults: {
    name: string;
    email: string;
    message: string;
  };
};

export function IntakeForm({ token, defaults }: Props) {
  const [name, setName] = useState(defaults.name);
  const [email, setEmail] = useState(defaults.email);

  function handleGoogle() {
    // TODO: start Google sign-in with your auth library.
    // Pass `token` through (callback URL or state) so that after sign-in
    // you can load client:${token} from Redis, create the client record,
    // delete the Redis key, and redirect to /client/[clientId]/...
    console.log("google sign-in", token);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: call a server action that registers with name + email,
    // using `token` to find the pending record.
    console.log("register", { token, name, email });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Hi {defaults.name.split(" ")[0]}, let&apos;s get started
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
        <button type="submit" className="w-full rounded bg-black px-4 py-2 text-white">
          Start questionnaire
        </button>
      </form>
    </div>
  );
}