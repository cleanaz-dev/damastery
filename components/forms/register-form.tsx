"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Props = {
  token: string;
  defaults: { name: string; email: string };
};

export function RegisterForm({ token, defaults }: Props) {
  const [name, setName] = useState(defaults.name);
  const [email, setEmail] = useState(defaults.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callbackURL = `/client/form/${token}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL,
    });

    setLoading(false);
    if (error) {
      setError(error.message ?? "Something went wrong");
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Hi {defaults.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-sm">
            Create your account to continue
          </p>
        </div>

        {/* Updated to use your GoogleButton's native callbackURL prop */}
        <GoogleButton 
          label="Continue with Google" 
          callbackURL={callbackURL} 
        />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-muted-foreground text-xs uppercase">or</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}