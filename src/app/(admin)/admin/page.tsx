"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Briefcase,
  ClipboardCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Job } from "@/types";

interface NurseWithRelations {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  date_of_birth: string | null;
  graduation_year: number | null;
  years_of_experience: number | null;
  bio: string | null;
  profile_complete: boolean;
  updated_at: string;
  user: { email: string; role: string };
  certifications: { id: string; cert_type: string }[];
  skills: { id: string; skill_name: string }[];
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [nurses, setNurses] = useState<NurseWithRelations[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        const [nursesRes, jobsRes] = await Promise.all([
          fetch("/api/nurses"),
          fetch("/api/jobs"),
        ]);

        if (!nursesRes.ok) {
          throw new Error("Failed to fetch nurses data");
        }
        if (!jobsRes.ok) {
          throw new Error("Failed to fetch jobs data");
        }

        const nursesData = await nursesRes.json();
        const jobsData = await jobsRes.json();

        setNurses(nursesData.nurses || []);
        setJobs(jobsData.jobs || []);
      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive mb-3">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Error loading dashboard</p>
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const totalNurses = nurses.length;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentRegistrations = nurses.filter(
    (n) => new Date(n.updated_at) >= sevenDaysAgo
  ).length;
  const activeJobs = jobs.filter((j) => j.is_active).length;
  const pendingReviews = nurses.filter((n) => !n.profile_complete).length;

  // Recent 10 nurse registrations (already sorted by updated_at desc from API)
  const recentNurses = nurses.slice(0, 10);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of the nurse staffing platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stats-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="stats-icon-blue">
                <Users />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalNurses}</p>
                <p className="text-sm text-gray-600">Total Nurses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="stats-icon-green">
                <UserPlus />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{recentRegistrations}</p>
                <p className="text-sm text-gray-600">New (7 days)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="stats-icon-blue">
                <Briefcase />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{activeJobs}</p>
                <p className="text-sm text-gray-600">Active Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="stats-icon-orange">
                <ClipboardCheck />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{pendingReviews}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations */}
      <Card className="section-card">
        <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40 rounded-t-lg overflow-hidden">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="section-icon">
                <Users />
              </div>
              Recent Registrations
            </CardTitle>
            <Link href="/admin/nurses">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentNurses.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No nurse registrations yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentNurses.map((nurse) => (
                <div
                  key={nurse.id}
                  className="flex items-center justify-between border rounded-lg p-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">
                        {nurse.first_name} {nurse.last_name}
                      </p>
                      {nurse.profile_complete ? (
                        <Badge variant="default" className="text-xs">
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Incomplete
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {nurse.user?.email}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>
                        {nurse.years_of_experience ?? 0} yrs experience
                      </span>
                      <span>
                        {nurse.certifications?.length ?? 0} certifications
                      </span>
                      <span>{nurse.skills?.length ?? 0} skills</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {new Date(nurse.updated_at).toLocaleDateString()}
                    </span>
                    <Link href={`/admin/nurses/${nurse.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="section-card">
          <CardHeader>
            <CardTitle className="text-lg">Nurse Management</CardTitle>
            <CardDescription>
              View, search, and filter registered nurses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/nurses">
              <Button className="w-full">
                <Users className="h-4 w-4 mr-2" />
                View All Nurses
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="section-card">
          <CardHeader>
            <CardTitle className="text-lg">Job Management</CardTitle>
            <CardDescription>
              Create, edit, and manage job postings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/jobs">
              <Button className="w-full">
                <Briefcase className="h-4 w-4 mr-2" />
                Manage Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
