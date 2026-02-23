"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { register } from "@/lib/api/authApi";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    if (form.password !== form.password_confirmation)
      errs.password_confirmation = "Passwords do not match.";
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
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed.";
      const fieldErrors = error.response?.data?.errors || {};
      setErrors(fieldErrors);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = "text", placeholder = "") => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={errors[key] ? "border-destructive" : ""}
        disabled={loading}
      />
      {errors[key] && (
        <p className="text-xs text-destructive">
          {Array.isArray(errors[key]) ? errors[key][0] : errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <Card className="shadow-xl border-border/60">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>Join E-Kart today — it&apos;s free</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {field("name", "Full Name", "text", "John Doe")}
          {field("email", "Email", "email", "you@example.com")}

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {Array.isArray(errors.password) ? errors.password[0] : errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirm Password</Label>
            <Input
              id="password_confirmation"
              type="password"
              placeholder="Re-enter password"
              value={form.password_confirmation}
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
              className={errors.password_confirmation ? "border-destructive" : ""}
              disabled={loading}
            />
            {errors.password_confirmation && (
              <p className="text-xs text-destructive">
                {errors.password_confirmation}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Creating account…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Create Account
              </span>
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
