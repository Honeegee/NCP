import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Building,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Briefcase,
  CalendarDays,
  Target,
  Send,
} from "lucide-react";
import { MatchScoreCircle } from "./MatchScoreCircle";
import type { JobMatch } from "@/types";

interface JobDetailPanelProps {
  jobMatch: JobMatch | null;
  isApplied: boolean;
  onApply: () => void;
  applyLoading: boolean;
}

export function JobDetailPanel({
  jobMatch,
  isApplied,
  onApply,
  applyLoading,
}: JobDetailPanelProps) {
  if (!jobMatch) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Select a job to view details</p>
        </div>
      </div>
    );
  }

  const { job } = jobMatch;
  const score = jobMatch.match_score;

  return (
    <div className="sticky top-20">
      <Card className="border-0 shadow-sm max-h-[calc(100vh-6rem)] overflow-y-auto">
        <CardContent className="py-5 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{job.title}</h2>
                {score >= 80 && (
                  <Badge className="gradient-primary border-0 text-white text-xs">
                    Top Match
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
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
            {score > 0 && (
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <MatchScoreCircle score={score} size="lg" />
                <span className="text-xs text-muted-foreground">Match</span>
              </div>
            )}
          </div>

          {/* Apply Button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={onApply}
              disabled={isApplied || applyLoading}
              className={isApplied ? "bg-emerald-600 hover:bg-emerald-600" : ""}
              size="lg"
            >
              {applyLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Applying...
                </>
              ) : isApplied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Applied
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Apply Now
                </>
              )}
            </Button>
            {isApplied && (
              <span className="text-xs text-muted-foreground">
                You&apos;ve already applied to this position
              </span>
            )}
          </div>

          <Separator />

          {/* Job Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Job Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <Separator />

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Requirements</h3>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Experience
              </p>
              <div className="flex items-center gap-2">
                {jobMatch.experience_match ? (
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
                    const matched = jobMatch.matched_certifications.includes(
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
                    const matched = jobMatch.matched_skills.includes(
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
          </div>

          <Separator />

          {/* Job Details */}
          <div>
            <h3 className="font-semibold mb-3">Job Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{job.employment_type}</p>
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
                      {job.salary_currency} {job.salary_min?.toLocaleString()}
                      {job.salary_max && ` - ${job.salary_max.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Min. Experience</p>
                  <p className="font-medium">
                    {job.min_experience_years} yr{job.min_experience_years !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
