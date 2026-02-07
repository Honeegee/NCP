"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Building,
  Clock,
  DollarSign,
  Search,
  Briefcase,
  Filter,
  Target,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import type { JobMatch } from "@/types";

export default function JobsPage() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [filtered, setFiltered] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch("/api/jobs/match");
        if (res.ok) {
          const data = await res.json();
          const matchList = data.matches || [];
          setMatches(matchList);
          setFiltered(matchList);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchMatches();
    }
  }, [session]);

  useEffect(() => {
    let result = matches;

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.job.title.toLowerCase().includes(s) ||
          m.job.facility_name.toLowerCase().includes(s) ||
          m.job.description.toLowerCase().includes(s)
      );
    }

    if (locationFilter) {
      const l = locationFilter.toLowerCase();
      result = result.filter((m) =>
        m.job.location.toLowerCase().includes(l)
      );
    }

    if (typeFilter) {
      result = result.filter((m) => m.job.employment_type === typeFilter);
    }

    setFiltered(result);
  }, [search, locationFilter, typeFilter, matches]);

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

  const locations = [...new Set(matches.map((m) => m.job.location))];
  const types = [...new Set(matches.map((m) => m.job.employment_type))];
  const highMatches = matches.filter((m) => m.match_score >= 70).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Job Matches
          </h1>
          <p className="text-muted-foreground mt-1">
            Jobs matched to your experience, certifications, and skills
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{matches.length}</span>
            <span className="text-muted-foreground">total</span>
          </div>
          {highMatches > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="font-medium text-emerald-700">{highMatches}</span>
              <span className="text-emerald-600">high match</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, facility, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="h-10 border rounded-lg pl-9 pr-8 text-sm bg-background appearance-none cursor-pointer hover:border-primary/50 transition-colors"
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
                  className="h-10 border rounded-lg pl-9 pr-8 text-sm bg-background appearance-none cursor-pointer hover:border-primary/50 transition-colors"
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
            </div>
          </div>
          {(search || locationFilter || typeFilter) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <span className="text-xs text-muted-foreground">
                Showing {filtered.length} of {matches.length} jobs
              </span>
              <button
                onClick={() => {
                  setSearch("");
                  setLocationFilter("");
                  setTypeFilter("");
                }}
                className="text-xs text-primary hover:underline ml-auto"
              >
                Clear filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium mb-1">
              {matches.length === 0
                ? "No job matches found"
                : "No jobs match your filters"}
            </p>
            <p className="text-sm text-muted-foreground">
              {matches.length === 0
                ? "Complete your profile to improve your job matches."
                : "Try adjusting your search criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((match) => (
            <Card
              key={match.job.id}
              className="border-0 shadow-sm hover-lift group cursor-pointer"
            >
              <CardContent className="py-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Job Info */}
                  <div className="flex-1 space-y-3 min-w-0">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {match.job.title}
                        </h3>
                        {match.match_score >= 80 && (
                          <Badge className="gradient-primary border-0 text-white text-xs">
                            Top Match
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1.5">
                          <Building className="h-4 w-4" />
                          {match.job.facility_name}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {match.job.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span className="capitalize">{match.job.employment_type}</span>
                        </span>
                        {(match.job.salary_min || match.job.salary_max) && (
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4" />
                            {match.job.salary_currency}{" "}
                            {match.job.salary_min?.toLocaleString()}
                            {match.job.salary_max &&
                              ` - ${match.job.salary_max.toLocaleString()}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {match.job.description}
                    </p>

                    {/* Requirements */}
                    <div className="flex flex-wrap gap-1.5">
                      {match.job.required_certifications.map((cert) => {
                        const matched = match.matched_certifications.includes(
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
                            {matched && <CheckCircle className="h-3 w-3 mr-1" />}
                            {cert}
                          </Badge>
                        );
                      })}
                      {match.job.required_skills.map((skill) => {
                        const matched = match.matched_skills.includes(
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
                            {skill}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="flex lg:flex-col items-center gap-3 lg:min-w-[100px] flex-shrink-0">
                    <div
                      className={`relative h-16 w-16 rounded-full flex items-center justify-center ${
                        match.match_score >= 70
                          ? "bg-emerald-50"
                          : match.match_score >= 40
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
                            match.match_score >= 70
                              ? "#16a34a"
                              : match.match_score >= 40
                              ? "#d97706"
                              : "#94a3b8"
                          }
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${(match.match_score / 100) * 175.9} 175.9`}
                          transform="rotate(-90 32 32)"
                        />
                      </svg>
                      <span
                        className={`text-lg font-bold ${
                          match.match_score >= 70
                            ? "text-emerald-600"
                            : match.match_score >= 40
                            ? "text-amber-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {match.match_score}%
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
