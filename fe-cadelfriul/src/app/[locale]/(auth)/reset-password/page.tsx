"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <>
      <h2 className="mb-2 text-center font-heading text-xl font-semibold">
        Reset Password
      </h2>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Enter your email address and we&apos;ll send you a link to reset your
        password.
      </p>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="your@email.com" required />
        </div>
        <Button type="submit" variant="default" className="w-full">
          Send Reset Link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-accent hover:underline">
          Back to Sign In
        </Link>
      </p>
    </>
  );
}
