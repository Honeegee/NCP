"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Building,
  Clock,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Briefcase,
  CalendarDays,
  Target,
} from "lucide-react";
import Link from "next/link";
import type { Job, JobMatch } from "@/types";

export default function JobDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [match, setMatch] = useState<JobMatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobRes, matchRes] = await Promise.all([
          fetch(`/api/jobs/${params.id}`),
          fetch("/api/jobs/match"),
        ]);

        if (jobRes.ok) {
          const jobData = await jobRes.json();
          setJob(jobData.job);
        }

        if (matchRes.ok) {
          const matchData = await matchRes.json();
          const found = (matchData.matches || []).find(
            (m: JobMatch) => m.job.id === params.id
          );
          setMatch(found || null);
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchData();
    }
  }, [session, params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium mb-1">Job not found</p>
          <p className="text-sm text-muted-foreground mb-4">
            This job may no longer be available.
          </p>
          <Button asChild variant="outline">
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const score = match?.match_score ?? 0;

  return (
    <div className="space-y-6 animate-fade-in mb-12 max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{job.title}</h1>
                {score >= 80 && (
                  <Badge className="gradient-primary border-0 text-white text-xs">
                    Top Match
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Building className="h-4 w-4" />
                  {job.facility_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span className="capitalize">{job.employment_type}</span>
                </span>
                {(job.salary_min || job.salary_max) && (
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    {job.salary_currency} {job.salary_min?.toLocaleString()}
                    {job.salary_max && ` - ${job.salary_max.toLocaleString()}`}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Match Score */}
            {match && (
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={`relative h-20 w-20 rounded-full flex items-center justify-center ${
                    score >= 70
                      ? "bg-emerald-50"
                      : score >= 40
                      ? "bg-amber-50"
                      : "bg-muted"
                  }`}
                >
                  <svg className="absolute inset-0" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke={
                        score >= 70
                          ? "#16a34a"
                          : score >= 40
                          ? "#d97706"
                          : "#94a3b8"
                      }
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(score / 100) * 175.9} 175.9`}
                      transform="rotate(-90 32 32)"
                    />
                  </svg>
                  <span
                    className={`text-xl font-bold ${
                      score >= 70
                        ? "text-emerald-600"
                        : score >= 40
                        ? "text-amber-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {score}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Match Score
                </span>
                {match.experience_match && (
                  <Badge variant="secondary" className="text-xs">
                    Exp. Match
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Description */}
        <div className="md:col-span-2 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="py-5">
              <h2 className="font-semibold text-lg mb-3">Job Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="border-0 shadow-sm">
            <CardContent className="py-5 space-y-4">
              <h2 className="font-semibold text-lg">Requirements</h2>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Experience
                </p>
                <div className="flex items-center gap-2">
                  {match?.experience_match ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    Minimum {job.min_experience_years} year
                    {job.min_experience_years !== 1 ? "s" : ""} of experience
                  </span>
                </div>
              </div>

              {job.required_certifications.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Certifications
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.required_certifications.map((cert) => {
                      const matched = match?.matched_certifications.includes(
                        cert.toLowerCase()
                      );
                      return (
                        <Badge
                          key={cert}
                          variant={matched ? "default" : "outline"}
                          className={`text-xs ${
                            matched
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                              : "text-muted-foreground"
                          }`}
                        >
                          {matched ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {cert}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {job.required_skills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((skill) => {
                      const matched = match?.matched_skills.includes(
                        skill.toLowerCase()
                      );
                      return (
                        <Badge
                          key={skill}
                          variant="outline"
                          className={`text-xs ${
                            matched
                              ? "border-primary/30 text-primary bg-primary/5"
                              : "text-muted-foreground"
                          }`}
                        >
                          {matched ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {skill}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="py-5 space-y-4">
              <h2 className="font-semibold">Job Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">
                      {job.employment_type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{job.location}</p>
                  </div>
                </div>
                {(job.salary_min || job.salary_max) && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Salary</p>
                      <p className="font-medium">
                        {job.salary_currency}{" "}
                        {job.salary_min?.toLocaleString()}
                        {job.salary_max &&
                          ` - ${job.salary_max.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Min. Experience
                    </p>
                    <p className="font-medium">
                      {job.min_experience_years} yr
                      {job.min_experience_years !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!match && (
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Complete your profile to see how well you match this job.
                </p>
                <Button size="sm" className="mt-3" asChild>
                  <Link href="/profile">Complete Profile</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
