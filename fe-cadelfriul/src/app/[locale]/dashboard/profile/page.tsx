"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import {
  updateProfile,
  fetchCustomerDetails,
  CustomerDetails,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [customerLoading, setCustomerLoading] = useState(true);
  const isLoading = authLoading || customerLoading;
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authUser?.id) return;
    let cancelled = false;
    setCustomerLoading(true);
    fetchCustomerDetails(authUser.id)
      .then((data) => {
        if (cancelled) return;
        setCustomer(data);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setPhone(data.phone);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load profile data.");
      })
      .finally(() => {
        if (!cancelled) setCustomerLoading(false);
      });
    return () => { cancelled = true; };
  }, [authUser?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(customer!.id, { firstName, lastName, phone });
      toast("Profile updated successfully!");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold">Profile</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your personal information and preferences.
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Your information is synced from your account.
      </p>
      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <form onSubmit={handleSave} className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Input
              id="email"
              type="email"
              defaultValue={customer?.email ?? ""}
              disabled
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Input
              id="phone"
              type="tel"
              placeholder="+39 XXX XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          )}
        </div>
        <Button type="submit" variant="default" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
