"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function SignupForm({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.session) {
        router.push("/onboarding");
        router.refresh();
      } else {
        toast.success(dict.auth.checkEmail);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{dict.auth.email}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{dict.auth.password}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        {pending ? dict.common.loading : dict.auth.signUp}
      </Button>
    </form>
  );
}
