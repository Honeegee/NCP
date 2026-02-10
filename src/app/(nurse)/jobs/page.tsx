"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Search,
  Briefcase,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Building,
  Clock,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { JobSidebar } from "@/components/jobs/JobSidebar";
import { JobDetailPanel } from "@/components/jobs/JobDetailPanel";
import { MatchScoreCircle } from "@/components/jobs/MatchScoreCircle";
import type { Job, JobMatch, JobApplication } from "@/types";
import { toast } from "sonner";

export default function JobsPage() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"matched" | "all">("matched");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    async function fetchData() {
      try {
        const [matchRes, allJobsRes, appsRes] = await Promise.all([
          fetch("/api/jobs/match"),
          fetch("/api/jobs"),
          fetch("/api/jobs/applications"),
        ]);

        if (matchRes.ok) {
          const data = await matchRes.json();
          setMatches(data.matches || []);
        }
        if (allJobsRes.ok) {
          const data = await allJobsRes.json();
          setAllJobs(data.jobs || []);
        }
        if (appsRes.ok) {
          const data = await appsRes.json();
          const ids = new Set<string>(
            (data.applications || []).map((a: JobApplication) => a.job_id)
          );
          setAppliedJobIds(ids);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  // Build sidebar items based on view mode
  const sidebarItems = useMemo(() => {
    let items: JobMatch[];

    if (viewMode === "matched") {
      items = matches;
    } else {
      const matchMap = new Map(matches.map((m) => [m.job.id, m]));
      items = allJobs.map((job) => {
        const existing = matchMap.get(job.id);
        return (
          existing || {
            job,
            match_score: 0,
            matched_certifications: [],
            matched_skills: [],
            experience_match: false,
          }
        );
      });
      // Sort by date for "All Jobs"
      items.sort(
        (a, b) =>
          new Date(b.job.created_at).getTime() -
          new Date(a.job.created_at).getTime()
      );
    }

    // Apply filters
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(
        (m) =>
          m.job.title.toLowerCase().includes(s) ||
          m.job.facility_name.toLowerCase().includes(s) ||
          m.job.description.toLowerCase().includes(s)
      );
    }
    if (locationFilter) {
      const l = locationFilter.toLowerCase();
      items = items.filter((m) => m.job.location.toLowerCase().includes(l));
    }
    if (typeFilter) {
      items = items.filter((m) => m.job.employment_type === typeFilter);
    }

    return items;
  }, [viewMode, matches, allJobs, search, locationFilter, typeFilter]);

  // Reset page when filters or view mode change
  useEffect(() => {
    setPage(1);
  }, [viewMode, search, locationFilter, typeFilter]);

  // Paginate sidebar items
  const totalPages = Math.max(1, Math.ceil(sidebarItems.length / ITEMS_PER_PAGE));
  const paginatedItems = sidebarItems.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Auto-select first job on current page
  useEffect(() => {
    if (paginatedItems.length > 0 && !paginatedItems.find((m) => m.job.id === selectedJobId)) {
      setSelectedJobId(paginatedItems[0].job.id);
    }
  }, [paginatedItems, selectedJobId]);

  // Get the selected job's match data
  const selectedJobMatch = useMemo(() => {
    if (!selectedJobId) return null;
    return sidebarItems.find((m) => m.job.id === selectedJobId) || null;
  }, [selectedJobId, sidebarItems]);

  async function handleApply() {
    if (!selectedJobId || appliedJobIds.has(selectedJobId)) return;

    setApplyLoading(true);
    try {
      const res = await fetch(`/api/jobs/${selectedJobId}/apply`, {
        method: "POST",
      });

      if (res.ok) {
        setAppliedJobIds((prev) => new Set([...prev, selectedJobId]));
        toast.success("Application submitted successfully!");
      } else {
        const data = await res.json();
        if (res.status === 409) {
          setAppliedJobIds((prev) => new Set([...prev, selectedJobId]));
          toast.info("You've already applied to this job");
        } else {
          toast.error(data.error || "Failed to apply");
        }
      }
    } catch (error) {
      console.error("Apply error:", error);
      toast.error("Something went wrong");
    } finally {
      setApplyLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Finding your best matches...</p>
        </div>
      </div>
    );
  }

  // Filter dropdown options
  const sourceJobs = viewMode === "matched" ? matches.map((m) => m.job) : allJobs;
  const locations = [...new Set(sourceJobs.map((j) => j.location))];
  const types = [...new Set(sourceJobs.map((j) => j.employment_type))];
  const totalCount = viewMode === "matched" ? matches.length : allJobs.length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header: title left, controls right */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold">Job Opportunities</h1>
          <p className="text-sm text-muted-foreground">
            {viewMode === "matched"
              ? `${matches.length} matched to your profile`
              : `${allJobs.length} available`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center md:ml-auto">
          {/* View Mode Toggle */}
          <div className="flex bg-muted rounded-lg p-0.5 flex-shrink-0">
            <button
              onClick={() => {
                setViewMode("matched");
                setSelectedJobId(null);
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "matched"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Matched ({matches.length})
            </button>
            <button
              onClick={() => {
                setViewMode("all");
                setSelectedJobId(null);
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "all"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Jobs ({allJobs.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-full sm:w-48"
            />
          </div>

          {/* Location + Type filters */}
          <div className="flex gap-2 flex-shrink-0">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="h-9 border rounded-lg pl-9 pr-8 text-sm bg-background appearance-none cursor-pointer hover:border-primary/50 transition-colors"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 border rounded-lg pl-9 pr-8 text-sm bg-background appearance-none cursor-pointer hover:border-primary/50 transition-colors"
              >
                <option value="">All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            {(search || locationFilter || typeFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setLocationFilter("");
                  setTypeFilter("");
                }}
                className="text-xs text-primary hover:underline px-2 whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop: Sidebar + Detail Panel */}
      <div className="hidden md:flex gap-4">
        <div className="w-[350px] flex-shrink-0 space-y-3 min-h-[calc(100vh-8rem)]">
          <JobSidebar
            items={paginatedItems}
            selectedJobId={selectedJobId}
            onSelectJob={setSelectedJobId}
            appliedJobIds={appliedJobIds}
            showMatchScore={viewMode === "matched"}
          />
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <span className="text-sm text-muted-foreground">
                {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        {/* Wrapper stretches to sidebar height; sticky child sticks within it */}
        <div className="flex-1 min-w-0">
          <JobDetailPanel
            jobMatch={selectedJobMatch}
            isApplied={appliedJobIds.has(selectedJobId || "")}
            onApply={handleApply}
            applyLoading={applyLoading}
          />
        </div>
      </div>

      {/* Mobile: Card list linking to detail pages */}
      <div className="md:hidden space-y-3 mb-12">
        {sidebarItems.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium mb-1">
                {totalCount === 0 ? "No jobs available" : "No jobs match your filters"}
              </p>
              <p className="text-sm text-muted-foreground">
                {totalCount === 0
                  ? "Check back later for new opportunities."
                  : "Try adjusting your search criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          sidebarItems.map((match) => (
            <Link key={match.job.id} href={`/jobs/${match.job.id}`}>
              <Card className="border-0 shadow-sm hover-lift group cursor-pointer">
                <CardContent className="py-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
                          {match.job.title}
                        </h3>
                        {match.match_score >= 80 && (
                          <Badge className="gradient-primary border-0 text-white text-xs">
                            Top Match
                          </Badge>
                        )}
                        {appliedJobIds.has(match.job.id) && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                            Applied
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="h-3.5 w-3.5" />
                          {match.job.facility_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {match.job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="capitalize">{match.job.employment_type}</span>
                        </span>
                        {match.job.salary_min && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            {match.job.salary_currency} {match.job.salary_min.toLocaleString()}
                            {match.job.salary_max && `–${match.job.salary_max.toLocaleString()}`}
                          </span>
                        )}
                      </div>
                    </div>
                    {viewMode === "matched" && match.match_score > 0 && (
                      <MatchScoreCircle score={match.match_score} size="sm" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
