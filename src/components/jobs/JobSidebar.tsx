import { Briefcase } from "lucide-react";
import { JobSidebarCard } from "./JobSidebarCard";
import type { JobMatch } from "@/types";

interface JobSidebarProps {
  items: JobMatch[];
  selectedJobId: string | null;
  onSelectJob: (id: string) => void;
  appliedJobIds: Set<string>;
  showMatchScore: boolean;
}

export function JobSidebar({
  items,
  selectedJobId,
  onSelectJob,
  appliedJobIds,
  showMatchScore,
}: JobSidebarProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center py-12">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Briefcase className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No jobs found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((match) => (
        <JobSidebarCard
          key={match.job.id}
          match={match}
          isSelected={match.job.id === selectedJobId}
          isApplied={appliedJobIds.has(match.job.id)}
          onClick={() => onSelectJob(match.job.id)}
          showMatchScore={showMatchScore}
        />
      ))}
    </div>
  );
}
