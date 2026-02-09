"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  ArrowRight,
  Loader2,
  AlertCircle,
  Users,
  X,
  CheckCircle,
  Clock,
  MapPin,
  GraduationCap,
  Briefcase,
  UserCheck,
  Target,
} from "lucide-react";
import { formatNurseName } from "@/lib/utils";

interface NurseListItem {
  id: string;
  first_name: string;
  last_name: string;
  years_of_experience: number | null;
  profile_complete: boolean;
  updated_at: string;
  professional_status: "registered_nurse" | "nursing_student" | null;
  location_type: "philippines" | "overseas" | null;
  employment_status: string | null;
  specialization: string | null;
  school_name: string | null;
  user: { email: string; role: string };
  certifications: { id: string; cert_type: string; nurse_id: string }[];
  skills: { id: string; skill_name: string; nurse_id: string }[];
}

export default function AdminNurseList() {
  const { data: session } = useSession();
  const [nurses, setNurses] = useState<NurseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchName, setSearchName] = useState("");
  const [certFilter, setCertFilter] = useState("");
  const [minExpFilter, setMinExpFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Debounce timer ref
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchName);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchName]);

  const fetchNurses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (certFilter) params.set("cert", certFilter);
      if (minExpFilter) params.set("min_exp", minExpFilter);

      const queryString = params.toString();
      const url = `/api/nurses${queryString ? `?${queryString}` : ""}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch nurses");

      const data = await res.json();
      let result: NurseListItem[] = data.nurses || [];

      // Client-side filters for status and location (not in API)
      if (statusFilter) {
        result = result.filter((n) => n.professional_status === statusFilter);
      }
      if (locationFilter) {
        result = result.filter((n) => n.location_type === locationFilter);
      }

      setNurses(result);
    } catch (err) {
      console.error("Nurse list fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load nurse list"
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, certFilter, minExpFilter, statusFilter, locationFilter]);

  useEffect(() => {
    if (session?.user) {
      fetchNurses();
    }
  }, [session, fetchNurses]);

  const clearFilters = () => {
    setSearchName("");
    setCertFilter("");
    setMinExpFilter("");
    setStatusFilter("");
    setLocationFilter("");
    setDebouncedSearch("");
  };

  const hasActiveFilters =
    searchName.trim() !== "" ||
    certFilter !== "" ||
    minExpFilter !== "" ||
    statusFilter !== "" ||
    locationFilter !== "";

  const totalNurses = nurses.length;
  const completeProfiles = nurses.filter((n) => n.profile_complete).length;
  const registeredNurses = nurses.filter((n) => n.professional_status === "registered_nurse").length;
  const students = nurses.filter((n) => n.professional_status === "nursing_student").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nurse Directory</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review registered nurses
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stats-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="stats-icon-blue">
                <Users />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalNurses}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="stats-icon-green">
                <UserCheck />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{completeProfiles}</p>
                <p className="text-sm text-gray-600">Complete</p>
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
                <p className="text-2xl font-bold text-gray-800">{registeredNurses}</p>
                <p className="text-sm text-gray-600">Reg. Nurses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="stats-icon-purple">
                <GraduationCap />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{students}</p>
                <p className="text-sm text-gray-600">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Compact Filters */}
      <div className="bg-muted/30 border border-border/50 rounded-lg p-4 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-8 h-9 text-sm bg-background"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 text-sm bg-background"
          >
            <SelectOption value="">All Status</SelectOption>
            <SelectOption value="registered_nurse">RN</SelectOption>
            <SelectOption value="nursing_student">Student</SelectOption>
          </Select>

          <Select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="h-9 text-sm bg-background"
          >
            <SelectOption value="">All Locations</SelectOption>
            <SelectOption value="philippines">Philippines</SelectOption>
            <SelectOption value="overseas">Overseas</SelectOption>
          </Select>

          <Select
            value={certFilter}
            onChange={(e) => setCertFilter(e.target.value)}
            className="h-9 text-sm bg-background"
          >
            <SelectOption value="">All Certs</SelectOption>
            <SelectOption value="PRC License">PRC</SelectOption>
            <SelectOption value="NCLEX">NCLEX</SelectOption>
            <SelectOption value="IELTS">IELTS</SelectOption>
            <SelectOption value="OET">OET</SelectOption>
            <SelectOption value="BLS">BLS</SelectOption>
            <SelectOption value="ACLS">ACLS</SelectOption>
          </Select>

          <Input
            type="number"
            min="0"
            placeholder="Min exp (yrs)"
            value={minExpFilter}
            onChange={(e) => setMinExpFilter(e.target.value)}
            className="h-9 text-sm bg-background"
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 text-sm hover:bg-background"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Clean Table */}
      <Card className="section-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-sm text-destructive font-medium">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={fetchNurses}
              >
                Retry
              </Button>
            </div>
          ) : nurses.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters ? "No nurses match your filters" : "No nurses registered yet"}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
                    <TableHead className="hidden sm:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="hidden md:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</TableHead>
                    <TableHead className="hidden lg:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">Experience</TableHead>
                    <TableHead className="hidden lg:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">Certifications</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nurses.map((nurse, index) => (
                    <TableRow key={nurse.id} className={`hover:bg-primary/[0.03] transition-colors ${index % 2 === 0 ? "" : "bg-muted/20"}`}>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-sm truncate">
                                {formatNurseName(
                                  nurse.first_name,
                                  nurse.last_name,
                                  nurse.professional_status
                                )}
                              </p>
                              {nurse.profile_complete ? (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {nurse.user?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">
                        <StatusBadge status={nurse.professional_status} />
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <LocationBadge location={nurse.location_type} />
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        {nurse.professional_status === "registered_nurse" ? (
                          <div className="text-sm">
                            <p className="font-medium">
                              {nurse.years_of_experience ?? 0} yrs
                            </p>
                            {nurse.specialization && (
                              <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {nurse.specialization}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        {nurse.certifications?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {nurse.certifications.slice(0, 2).map((cert) => (
                              <Badge
                                key={cert.id}
                                variant="secondary"
                                className="text-xs px-2 py-0"
                              >
                                {cert.cert_type}
                              </Badge>
                            ))}
                            {nurse.certifications.length > 2 && (
                              <Badge variant="outline" className="text-xs px-2 py-0">
                                +{nurse.certifications.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/nurses/${nurse.id}/matches`}>
                            <Button variant="ghost" size="sm" className="h-8">
                              <Target className="h-3.5 w-3.5 mr-1" />
                              Matches
                            </Button>
                          </Link>
                          <Link href={`/admin/nurses/${nurse.id}`}>
                            <Button variant="ghost" size="sm" className="h-8">
                              View
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "registered_nurse" | "nursing_student" | null;
}) {
  if (status === "registered_nurse") {
    return (
      <Badge variant="secondary" className="text-xs gap-1">
        <Briefcase className="h-2.5 w-2.5" />
        RN
      </Badge>
    );
  }
  if (status === "nursing_student") {
    return (
      <Badge variant="outline" className="text-xs gap-1">
        <GraduationCap className="h-2.5 w-2.5" />
        Student
      </Badge>
    );
  }
  return <span className="text-xs text-muted-foreground">—</span>;
}

function LocationBadge({
  location,
}: {
  location: "philippines" | "overseas" | null;
}) {
  if (location === "philippines") {
    return (
      <Badge variant="secondary" className="text-xs gap-1">
        <MapPin className="h-2.5 w-2.5" />
        PH
      </Badge>
    );
  }
  if (location === "overseas") {
    return (
      <Badge variant="outline" className="text-xs gap-1">
        <MapPin className="h-2.5 w-2.5" />
        Overseas
      </Badge>
    );
  }
  return <span className="text-xs text-muted-foreground">—</span>;
}