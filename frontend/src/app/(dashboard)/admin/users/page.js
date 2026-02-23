"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Shield,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllUsers } from "@/lib/api/userApi";

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48 ml-auto" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(
    async (pageNum = 1, silent = false) => {
      if (!session?.accessToken) return;
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const data = await getAllUsers(session.accessToken, pageNum);
        setUsers(data.data || []);
        setMeta(data);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load users."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session]
  );

  useEffect(() => {
    if (status === "authenticated") fetchUsers(page);
  }, [status, page, fetchUsers]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {meta?.total !== undefined
              ? `${meta.total} total registered users`
              : "All registered users"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers(page, true)}
          disabled={refreshing || loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{meta?.total ?? "—"}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "admin").length}
              </p>
              <p className="text-sm text-muted-foreground">
                Admins (this page)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">All Users</CardTitle>
          <CardDescription>
            Showing page {meta?.current_page ?? 1} of {meta?.last_page ?? 1}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user, idx) => {
                      const initials = user.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "U";
                      const joined = user.created_at
                        ? new Date(user.created_at).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )
                        : "—";
                      return (
                        <TableRow key={user.id} className="group">
                          <TableCell className="text-muted-foreground text-xs">
                            {(meta?.from ?? 0) + idx}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-7 h-7">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">
                                {user.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "admin" ? "default" : "secondary"
                              }
                              className="capitalize text-xs"
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {joined}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {meta.from}–{meta.to} of {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              <span className="text-sm font-medium px-2">
                {page} / {meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= meta.last_page || loading}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
