"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { me } from "@/lib/api/authApi";
import { updateUser } from "@/lib/api/userApi";

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      me(session.accessToken)
        .then((data) => {
          setForm({ name: data.user.name, email: data.user.email });
        })
        .catch(() => toast.error("Failed to load profile."))
        .finally(() => setLoading(false));
    }
  }, [status, session]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await updateUser(session.user.id, form, session.accessToken);
      toast.success("Profile updated successfully!");
      router.push("/profile");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile.";
      const fieldErrors = err.response?.data?.errors || {};
      setErrors(fieldErrors);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/profile">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground text-sm">
            Update your account information
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>
            Changes will be saved immediately to your account.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Separator />

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={errors.name ? "border-destructive" : ""}
                disabled={saving}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {Array.isArray(errors.name) ? errors.name[0] : errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={errors.email ? "border-destructive" : ""}
                disabled={saving}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </span>
              )}
            </Button>
            <Button variant="outline" type="button" asChild disabled={saving}>
              <Link href="/profile">Cancel</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
