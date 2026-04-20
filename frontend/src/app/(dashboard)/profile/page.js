"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Pencil,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { me } from "@/lib/api/authApi";

function ProfileSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-px w-full" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      me(session.accessToken)
        .then((data) => setUser(data.user))
        .catch(() => toast.error("Failed to load profile."))
        .finally(() => setLoading(false));
    }
  }, [status, session]);

  if (loading || status === "loading") return <ProfileSkeleton />;

  if (!user) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Unable to load profile. Please refresh.
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";

  const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            View and manage your account information
          </p>
        </div>
        <Button asChild>
          <Link href="/profile/edit" className="flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 ring-4 ring-border">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription className="mt-0.5">{user.email}</CardDescription>
              <div className="mt-2">
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {user.role === "admin" ? (
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Admin
                    </span>
                  ) : (
                    user.role
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator />

          <div className="grid gap-4">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="text-muted-foreground">Full Name</span>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="text-muted-foreground">Email Address</span>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="text-muted-foreground">Role</span>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
            </div>

            {user.created_at && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground">Member Since</span>
                  <p className="font-medium">{joinedDate}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
