"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  AlertCircle,
  Target,
  TrendingUp,
  Loader2,
  User,
} from "lucide-react";
import type { JobMatch } from "@/types";

export default function AdminNurseMatches() {
  const { data: session } = useSession();
  const params = useParams();
  const nurseId = params.id as string;

  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nurseName, setNurseName] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, matchesRes] = await Promise.all([
          fetch(`/api/nurses/${nurseId}`),
          fetch(`/api/nurses/${nurseId}/matches`),
        ]);

        if (!profileRes.ok) throw new Error("Failed to fetch nurse profile");
        const profileData = await profileRes.json();
        const p = profileData.profile;
        setNurseName(`${p.first_name || ""} ${p.last_name || ""}`.trim() || "Nurse");

        if (matchesRes.ok) {
          const matchData = await matchesRes.json();
          setMatches(matchData.matches || []);
        }
      } catch (err) {
        console.error("Matches page error:", err);
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    if (session?.user && nurseId) {
      fetchData();
    }
  }, [session, nurseId]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/nurses"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Nurses
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Job Matches</h1>
          {nurseName && (
            <p className="text-muted-foreground mt-1">{nurseName}</p>
          )}
        </div>
        <Link href={`/admin/nurses/${nurseId}`}>
          <Button variant="outline" size="sm">
            <User className="h-3.5 w-3.5 mr-1" />
            View Profile
          </Button>
        </Link>
      </div>

      {/* Content */}
      <Card className="section-card">
        <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40 rounded-t-lg overflow-hidden">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="h-9 w-9 rounded-xl bg-sky-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <span>Ranked Job Matches</span>
              {!loading && (
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  {matches.length} active jobs scored
                </p>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Loading matches...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No active jobs to match against</p>
            </div>
          ) : (
            <div className="space-y-0">
              {matches.map((match, index) => (
                <div
                  key={match.job.id}
                  className={`flex items-start gap-3 py-4 ${index !== 0 ? "border-t border-border/50" : ""}`}
                >
                  <div className="h-9 w-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingUp className="h-4 w-4 text-sky-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{match.job.title}</p>
                        <p className="text-sm text-sky-600 font-medium mt-0.5">{match.job.facility_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{match.job.location}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-sm font-semibold flex-shrink-0 ${
                          match.match_score >= 70
                            ? "bg-green-50 text-green-700 border-green-200"
                            : match.match_score >= 40
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        {match.match_score}%
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                      {match.experience_match && (
                        <span className="text-green-600 font-medium">✓ Experience</span>
                      )}
                      {match.job.min_experience_years > 0 && (
                        <span>{match.job.min_experience_years}+ yrs required</span>
                      )}
                    </div>
                    {(match.matched_certifications.length > 0 || match.matched_skills.length > 0) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {match.matched_certifications.map((c) => (
                          <span key={c} className="text-xs bg-sky-50 text-sky-700 border border-sky-200 rounded px-1.5 py-0.5">{c}</span>
                        ))}
                        {match.matched_skills.map((s) => (
                          <span key={s} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded px-1.5 py-0.5">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
