"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";

interface NurseListItem {
  id: string;
  first_name: string;
  last_name: string;
  years_of_experience: number | null;
  profile_complete: boolean;
  updated_at: string;
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

  // Debounce timer ref
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce the search input
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
      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }
      if (certFilter) {
        params.set("cert", certFilter);
      }
      if (minExpFilter) {
        params.set("min_exp", minExpFilter);
      }

      const queryString = params.toString();
      const url = `/api/nurses${queryString ? `?${queryString}` : ""}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch nurses");
      }

      const data = await res.json();
      setNurses(data.nurses || []);
    } catch (err) {
      console.error("Nurse list fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load nurse list"
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, certFilter, minExpFilter]);

  useEffect(() => {
    if (session?.user) {
      fetchNurses();
    }
  }, [session, fetchNurses]);

  const clearFilters = () => {
    setSearchName("");
    setCertFilter("");
    setMinExpFilter("");
    setDebouncedSearch("");
  };

  const hasActiveFilters =
    searchName.trim() !== "" || certFilter !== "" || minExpFilter !== "";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Nurse Directory</h1>
          <p className="text-muted-foreground">
            Search and manage all registered nurses
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search by name */}
            <div className="space-y-2">
              <Label htmlFor="search-name">Search by Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-name"
                  placeholder="First or last name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filter by certification */}
            <div className="space-y-2">
              <Label htmlFor="cert-filter">Certification</Label>
              <Select
                id="cert-filter"
                value={certFilter}
                onChange={(e) => setCertFilter(e.target.value)}
              >
                <SelectOption value="">All Certifications</SelectOption>
                <SelectOption value="PRC License">PRC License</SelectOption>
                <SelectOption value="NCLEX">NCLEX</SelectOption>
                <SelectOption value="IELTS">IELTS</SelectOption>
                <SelectOption value="OET">OET</SelectOption>
                <SelectOption value="BLS">BLS</SelectOption>
                <SelectOption value="ACLS">ACLS</SelectOption>
              </Select>
            </div>

            {/* Filter by minimum experience */}
            <div className="space-y-2">
              <Label htmlFor="min-exp">Min. Experience (years)</Label>
              <Input
                id="min-exp"
                type="number"
                min="0"
                placeholder="e.g. 2"
                value={minExpFilter}
                onChange={(e) => setMinExpFilter(e.target.value)}
              />
            </div>

            {/* Clear filters */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Nurses
              {!loading && (
                <Badge variant="secondary" className="ml-2">
                  {nurses.length} result{nurses.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">Loading nurses...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-destructive font-medium">{error}</p>
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
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? "No nurses match the current filters."
                  : "No nurses registered yet."}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={clearFilters}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Email
                    </TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Certifications
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Skills
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Updated
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nurses.map((nurse) => (
                    <TableRow key={nurse.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {nurse.first_name} {nurse.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {nurse.user?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {nurse.user?.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {nurse.years_of_experience ?? 0} yr
                          {(nurse.years_of_experience ?? 0) !== 1 ? "s" : ""}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {nurse.certifications?.length > 0 ? (
                            nurse.certifications.slice(0, 3).map((cert) => (
                              <Badge
                                key={cert.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {cert.cert_type}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              None
                            </span>
                          )}
                          {nurse.certifications?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{nurse.certifications.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">
                          {nurse.skills?.length ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {new Date(nurse.updated_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/nurses/${nurse.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
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
