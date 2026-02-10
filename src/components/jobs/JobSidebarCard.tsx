import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { MatchScoreCircle } from "./MatchScoreCircle";
import type { JobMatch } from "@/types";

interface JobSidebarCardProps {
  match: JobMatch;
  isSelected: boolean;
  isApplied: boolean;
  onClick: () => void;
  showMatchScore: boolean;
}

export function JobSidebarCard({
  match,
  isSelected,
  isApplied,
  onClick,
  showMatchScore,
}: JobSidebarCardProps) {
  return (
    <Card
      className={cn(
        "border shadow-sm cursor-pointer transition-all hover:border-primary/50",
        isSelected && "border-primary bg-primary/5 shadow-md"
      )}
      onClick={onClick}
    >
      <CardContent className="py-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate">{match.job.title}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Building className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{match.job.facility_name}</span>
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{match.job.location}</span>
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="secondary" className="text-[10px] capitalize px-1.5 py-0">
                {match.job.employment_type}
              </Badge>
              {match.job.salary_min && (
                <span className="text-[10px] text-muted-foreground">
                  {match.job.salary_currency} {match.job.salary_min.toLocaleString()}
                  {match.job.salary_max && `–${match.job.salary_max.toLocaleString()}`}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {showMatchScore && match.match_score > 0 && (
              <MatchScoreCircle score={match.match_score} size="sm" />
            )}
            {isApplied && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0">
                Applied
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
