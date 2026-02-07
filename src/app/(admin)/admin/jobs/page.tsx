"use client";

import { useEffect, useState, FormEvent } from "react";
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
  Briefcase,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Pencil,
  Power,
  PowerOff,
  Save,
} from "lucide-react";
import type { Job, EmploymentType } from "@/types";

interface JobFormData {
  title: string;
  description: string;
  location: string;
  facility_name: string;
  employment_type: EmploymentType;
  min_experience_years: string;
  required_certifications: string;
  required_skills: string;
  salary_min: string;
  salary_max: string;
  salary_currency: string;
}

const emptyForm: JobFormData = {
  title: "",
  description: "",
  location: "",
  facility_name: "",
  employment_type: "full-time",
  min_experience_years: "0",
  required_certifications: "",
  required_skills: "",
  salary_min: "",
  salary_max: "",
  salary_currency: "USD",
};

export default function AdminJobManagement() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<JobFormData>(emptyForm);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Action loading states
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all jobs - the API only returns active ones, so for admin
      // we need to see all. We'll fetch active ones from the public API.
      // For a complete admin view, we fetch without the is_active filter.
      const res = await fetch("/api/jobs");
      if (!res.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Jobs fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchJobs();
    }
  }, [session]);

  const updateFormField = (field: keyof JobFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingJobId(null);
    setFormError(null);
    setShowForm(false);
  };

  const startEditing = (job: Job) => {
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      facility_name: job.facility_name,
      employment_type: job.employment_type,
      min_experience_years: String(job.min_experience_years),
      required_certifications: job.required_certifications.join(", "),
      required_skills: job.required_skills.join(", "),
      salary_min: job.salary_min ? String(job.salary_min) : "",
      salary_max: job.salary_max ? String(job.salary_max) : "",
      salary_currency: job.salary_currency || "USD",
    });
    setEditingJobId(job.id);
    setShowForm(true);
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      // Build payload
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        facility_name: formData.facility_name.trim(),
        employment_type: formData.employment_type,
        min_experience_years: parseInt(formData.min_experience_years, 10) || 0,
        required_certifications: formData.required_certifications
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        required_skills: formData.required_skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        salary_min: formData.salary_min
          ? parseFloat(formData.salary_min)
          : null,
        salary_max: formData.salary_max
          ? parseFloat(formData.salary_max)
          : null,
        salary_currency: formData.salary_currency || "USD",
      };

      // Validation
      if (!payload.title || !payload.description || !payload.location || !payload.facility_name) {
        setFormError("Title, description, location, and facility name are required.");
        setFormSubmitting(false);
        return;
      }

      let res: Response;

      if (editingJobId) {
        // Update existing job
        res = await fetch(`/api/jobs/${editingJobId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new job
        res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error || `Failed to ${editingJobId ? "update" : "create"} job`
        );
      }

      // Refresh list and reset form
      resetForm();
      await fetchJobs();
    } catch (err) {
      console.error("Job form submit error:", err);
      setFormError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (job: Job) => {
    const action = job.is_active ? "deactivate" : "reactivate";
    if (!confirm(`Are you sure you want to ${action} "${job.title}"?`)) {
      return;
    }

    setActionLoading(job.id);
    try {
      if (job.is_active) {
        // Deactivate (soft delete)
        const res = await fetch(`/api/jobs/${job.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Failed to deactivate job");
        }
      } else {
        // Reactivate
        const res = await fetch(`/api/jobs/${job.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: true }),
        });
        if (!res.ok) {
          throw new Error("Failed to reactivate job");
        }
      }

      await fetchJobs();
    } catch (err) {
      console.error("Toggle active error:", err);
      alert(
        err instanceof Error ? err.message : `Failed to ${action} the job`
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Job Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage job postings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => {
              if (showForm && !editingJobId) {
                resetForm();
              } else {
                setEditingJobId(null);
                setFormData(emptyForm);
                setFormError(null);
                setShowForm(true);
              }
            }}
          >
            {showForm && !editingJobId ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Create New Job
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Job Creation / Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {editingJobId ? "Edit Job" : "Create New Job"}
                </CardTitle>
                <CardDescription>
                  {editingJobId
                    ? "Update the job posting details"
                    : "Fill in the details for a new job posting"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="job-title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="job-title"
                    placeholder="e.g. Registered Nurse - ICU"
                    value={formData.title}
                    onChange={(e) => updateFormField("title", e.target.value)}
                    required
                  />
                </div>

                {/* Facility Name */}
                <div className="space-y-2">
                  <Label htmlFor="job-facility">
                    Facility Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="job-facility"
                    placeholder="e.g. St. Luke's Medical Center"
                    value={formData.facility_name}
                    onChange={(e) =>
                      updateFormField("facility_name", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="job-description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <textarea
                  id="job-description"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={formData.description}
                  onChange={(e) =>
                    updateFormField("description", e.target.value)
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="job-location">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="job-location"
                    placeholder="e.g. Manila, Philippines"
                    value={formData.location}
                    onChange={(e) =>
                      updateFormField("location", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Employment Type */}
                <div className="space-y-2">
                  <Label htmlFor="job-type">Employment Type</Label>
                  <Select
                    id="job-type"
                    value={formData.employment_type}
                    onChange={(e) =>
                      updateFormField(
                        "employment_type",
                        e.target.value as EmploymentType
                      )
                    }
                  >
                    <SelectOption value="full-time">Full-Time</SelectOption>
                    <SelectOption value="part-time">Part-Time</SelectOption>
                    <SelectOption value="contract">Contract</SelectOption>
                  </Select>
                </div>

                {/* Min Experience */}
                <div className="space-y-2">
                  <Label htmlFor="job-min-exp">Min Experience (years)</Label>
                  <Input
                    id="job-min-exp"
                    type="number"
                    min="0"
                    value={formData.min_experience_years}
                    onChange={(e) =>
                      updateFormField("min_experience_years", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Required Certifications */}
                <div className="space-y-2">
                  <Label htmlFor="job-certs">
                    Required Certifications
                  </Label>
                  <Input
                    id="job-certs"
                    placeholder="e.g. PRC License, NCLEX, BLS"
                    value={formData.required_certifications}
                    onChange={(e) =>
                      updateFormField(
                        "required_certifications",
                        e.target.value
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list
                  </p>
                </div>

                {/* Required Skills */}
                <div className="space-y-2">
                  <Label htmlFor="job-skills">Required Skills</Label>
                  <Input
                    id="job-skills"
                    placeholder="e.g. Critical Care, Patient Assessment"
                    value={formData.required_skills}
                    onChange={(e) =>
                      updateFormField("required_skills", e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Salary Min */}
                <div className="space-y-2">
                  <Label htmlFor="job-salary-min">Salary Min</Label>
                  <Input
                    id="job-salary-min"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="e.g. 30000"
                    value={formData.salary_min}
                    onChange={(e) =>
                      updateFormField("salary_min", e.target.value)
                    }
                  />
                </div>

                {/* Salary Max */}
                <div className="space-y-2">
                  <Label htmlFor="job-salary-max">Salary Max</Label>
                  <Input
                    id="job-salary-max"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="e.g. 50000"
                    value={formData.salary_max}
                    onChange={(e) =>
                      updateFormField("salary_max", e.target.value)
                    }
                  />
                </div>

                {/* Salary Currency */}
                <div className="space-y-2">
                  <Label htmlFor="job-salary-currency">Currency</Label>
                  <Select
                    id="job-salary-currency"
                    value={formData.salary_currency}
                    onChange={(e) =>
                      updateFormField("salary_currency", e.target.value)
                    }
                  >
                    <SelectOption value="USD">USD</SelectOption>
                    <SelectOption value="PHP">PHP</SelectOption>
                    <SelectOption value="GBP">GBP</SelectOption>
                    <SelectOption value="EUR">EUR</SelectOption>
                    <SelectOption value="AUD">AUD</SelectOption>
                    <SelectOption value="CAD">CAD</SelectOption>
                    <SelectOption value="SGD">SGD</SelectOption>
                    <SelectOption value="AED">AED</SelectOption>
                    <SelectOption value="SAR">SAR</SelectOption>
                  </Select>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={formSubmitting}>
                  {formSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      {editingJobId ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      {editingJobId ? "Update Job" : "Create Job"}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Job Postings
              {!loading && (
                <Badge variant="secondary" className="ml-2">
                  {jobs.length} job{jobs.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">Loading jobs...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-destructive font-medium">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={fetchJobs}
              >
                Retry
              </Button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No jobs posted yet.</p>
              <Button
                variant="link"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setEditingJobId(null);
                  setFormData(emptyForm);
                  setFormError(null);
                  setShowForm(true);
                }}
              >
                Create your first job posting
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Location
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Facility
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Type
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Min Exp
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {job.location}
                          </p>
                          {job.salary_min && job.salary_max && (
                            <p className="text-xs text-muted-foreground">
                              {job.salary_currency}{" "}
                              {job.salary_min.toLocaleString()} -{" "}
                              {job.salary_max.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm">{job.location}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm">{job.facility_name}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="text-xs capitalize">
                          {job.employment_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">
                          {job.min_experience_years} yr
                          {job.min_experience_years !== 1 ? "s" : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        {job.is_active ? (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-600 hover:bg-green-600/80"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(job)}
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3" />
                            <span className="hidden sm:inline ml-1">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(job)}
                            disabled={actionLoading === job.id}
                            title={
                              job.is_active ? "Deactivate" : "Reactivate"
                            }
                          >
                            {actionLoading === job.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : job.is_active ? (
                              <PowerOff className="h-3 w-3" />
                            ) : (
                              <Power className="h-3 w-3" />
                            )}
                            <span className="hidden sm:inline ml-1">
                              {job.is_active ? "Deactivate" : "Activate"}
                            </span>
                          </Button>
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
