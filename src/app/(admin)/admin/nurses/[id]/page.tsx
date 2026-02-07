"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  GraduationCap,
  FileText,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Star,
  Download,
  CheckCircle,
  Clock,
  Shield,
  Sparkles,
  Building2,
  Hash,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { NurseFullProfile } from "@/types";

export default function AdminNurseDetail() {
  const { data: session } = useSession();
  const params = useParams();
  const nurseId = params.id as string;

  const [profile, setProfile] = useState<NurseFullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/nurses/${nurseId}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Nurse profile not found");
          }
          throw new Error("Failed to fetch nurse profile");
        }

        const data = await res.json();
        setProfile(data.profile);
      } catch (err) {
        console.error("Nurse detail fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load nurse profile"
        );
      } finally {
        setLoading(false);
      }
    }

    if (session?.user && nurseId) {
      fetchProfile();
    }
  }, [session, nurseId]);

  const handleRequestUpdate = () => {
    alert(
      `A profile update request would be sent to ${profile?.first_name} ${profile?.last_name} (${profile?.user?.email}).`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading nurse profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-0 shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-400 to-rose-400" />
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="font-semibold text-foreground">
                {error || "Nurse profile not found"}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <Link href="/admin/nurses">
                <Button variant="outline" size="sm" className="rounded-xl">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to List
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestResume =
    profile.resumes && profile.resumes.length > 0 ? profile.resumes[0] : null;

  const initials = `${(profile.first_name || "N")[0]}${(profile.last_name || "U")[0]}`.toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-8 text-white">
        <div className="absolute inset-0 pattern-dots opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative">
          {/* Back button */}
          <Link href="/admin/nurses" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Nurses
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm border border-white/20 shadow-lg">
                {initials}
              </div>
              {profile.profile_complete && (
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-400 flex items-center justify-center border-2 border-white shadow-sm">
                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h1>
                {profile.profile_complete ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-400/20 text-xs font-medium text-emerald-200 border border-emerald-400/20">
                    <CheckCircle className="h-3 w-3" />
                    Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 text-xs font-medium text-amber-200 border border-amber-400/20">
                    <Clock className="h-3 w-3" />
                    Incomplete
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {profile.user?.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {profile.phone}
                  </span>
                )}
                {profile.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {[profile.city, profile.country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestUpdate}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm flex-shrink-0"
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Request Update
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-400/20 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-blue-300" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Experience</p>
                  <p className="text-sm font-semibold">{profile.years_of_experience ?? 0} Years</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-400/20 flex items-center justify-center">
                  <Award className="h-4 w-4 text-amber-300" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Certifications</p>
                  <p className="text-sm font-semibold">{profile.certifications?.length || 0} On File</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-violet-400/20 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-violet-300" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Skills</p>
                  <p className="text-sm font-semibold">{profile.skills?.length || 0} Listed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-400/20 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-emerald-300" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Resumes</p>
                  <p className="text-sm font-semibold">{profile.resumes?.length || 0} Uploaded</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal">
        <TabsList className="bg-white border shadow-sm p-1.5 rounded-xl flex flex-wrap">
          <TabsTrigger value="personal" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
            <div className="h-5 w-5 rounded-md bg-blue-100 flex items-center justify-center">
              <User className="h-3 w-3 text-blue-600" />
            </div>
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="experience" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
            <div className="h-5 w-5 rounded-md bg-emerald-100 flex items-center justify-center">
              <Briefcase className="h-3 w-3 text-emerald-600" />
            </div>
            Experience
          </TabsTrigger>
          <TabsTrigger value="certifications" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
            <div className="h-5 w-5 rounded-md bg-amber-100 flex items-center justify-center">
              <Award className="h-3 w-3 text-amber-600" />
            </div>
            Certifications
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
            <div className="h-5 w-5 rounded-md bg-violet-100 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-violet-600" />
            </div>
            Skills
          </TabsTrigger>
          <TabsTrigger value="resume" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
            <div className="h-5 w-5 rounded-md bg-rose-100 flex items-center justify-center">
              <FileText className="h-3 w-3 text-rose-600" />
            </div>
            Resume
          </TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-blue-100/50">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">First Name</p>
                    <p className="font-semibold">{profile.first_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Name</p>
                    <p className="font-semibold">{profile.last_name}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date of Birth</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-orange-500" />
                      {profile.date_of_birth
                        ? new Date(profile.date_of_birth).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Country</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-500" />
                      {profile.country || "N/A"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bio</p>
                  <p className="text-sm leading-relaxed">
                    {profile.bio || "No bio provided."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-b border-emerald-100/50">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-emerald-600" />
                  </div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                  <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-sm">{profile.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100/50">
                  <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium text-sm">{profile.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100/50">
                  <div className="h-9 w-9 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-medium text-sm">
                      {[profile.address, profile.city, profile.country]
                        .filter(Boolean)
                        .join(", ") || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50/50 border border-violet-100/50">
                    <div className="h-9 w-9 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Grad Year</p>
                      <p className="font-medium text-sm">{profile.graduation_year || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
                    <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="font-medium text-sm">{profile.years_of_experience ?? 0} years</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <Card className="lg:col-span-2 border-0 shadow-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-violet-50/80 to-purple-50/80 border-b border-violet-100/50">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-violet-600" />
                    </div>
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.education.map((edu) => (
                      <div
                        key={edu.id}
                        className="group flex items-start gap-3 p-4 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50/40 to-transparent hover:shadow-md transition-all"
                      >
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <GraduationCap className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{edu.institution}</p>
                          <p className="text-sm text-muted-foreground">
                            {edu.degree}
                            {edu.field_of_study ? ` - ${edu.field_of_study}` : ""}
                          </p>
                          {edu.graduation_year && (
                            <Badge variant="outline" className="mt-1.5 text-xs bg-violet-50 text-violet-600 border-violet-200">
                              Class of {edu.graduation_year}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-b border-emerald-100/50">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <span>Work Experience</span>
                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                    {profile.years_of_experience ?? 0} years total experience
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {profile.experience && profile.experience.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-300 via-teal-200 to-transparent" />

                  <div className="space-y-4">
                    {profile.experience.map((exp) => (
                      <div key={exp.id} className="relative pl-12">
                        {/* Timeline dot */}
                        <div className="absolute left-[14px] top-5 h-4 w-4 rounded-full border-[3px] border-emerald-400 bg-white z-10" />

                        <div className="group rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/40 to-transparent p-5 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between flex-wrap gap-3">
                            <div>
                              <p className="font-semibold text-foreground text-base">{exp.position}</p>
                              <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5 mt-0.5">
                                <Building2 className="h-3.5 w-3.5" />
                                {exp.employer}
                              </p>
                              {exp.department && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Department: {exp.department}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {exp.start_date
                                ? new Date(exp.start_date).toLocaleDateString(
                                    undefined,
                                    { year: "numeric", month: "short" }
                                  )
                                : "N/A"}{" "}
                              -{" "}
                              {exp.end_date
                                ? new Date(exp.end_date).toLocaleDateString(
                                    undefined,
                                    { year: "numeric", month: "short" }
                                  )
                                : "Present"}
                            </Badge>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 rounded-xl bg-muted/20 border border-dashed border-muted-foreground/20">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="h-7 w-7 text-emerald-300" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No work experience records added</p>
                </div>
              )}

              {/* Parsed resume experience */}
              {latestResume?.parsed_data?.experience &&
                latestResume.parsed_data.experience.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded-md bg-sky-100 flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                        </div>
                        <span className="text-sky-700">Extracted from Resume</span>
                      </h3>
                      <div className="space-y-3">
                        {latestResume.parsed_data.experience.map(
                          (exp, index) => (
                            <div
                              key={index}
                              className="border border-dashed border-sky-200 rounded-xl p-4 bg-sky-50/30"
                            >
                              <p className="font-medium text-sm">
                                {exp.position || "Unknown Position"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {exp.employer || "Unknown Employer"}
                                {exp.department ? ` - ${exp.department}` : ""}
                              </p>
                              <p className="text-xs text-sky-600 mt-1">
                                {exp.start_date || "?"} - {exp.end_date || "Present"}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50/80 to-yellow-50/80 border-b border-amber-100/50">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <span>Certifications</span>
                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                    {profile.certifications?.length ?? 0} certifications on file
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {profile.certifications && profile.certifications.length > 0 ? (
                <div className="space-y-3">
                  {profile.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="group rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50/40 to-transparent p-5 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="flex items-start gap-3">
                          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <Award className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">{cert.cert_type}</p>
                              {cert.verified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
                                  <Shield className="h-3 w-3" />
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-xs font-medium text-orange-700">
                                  <Clock className="h-3 w-3" />
                                  Unverified
                                </span>
                              )}
                            </div>
                            {cert.cert_number && (
                              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                                <Hash className="h-3 w-3 text-amber-500" />
                                {cert.cert_number}
                              </p>
                            )}
                            {cert.score && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <Star className="h-3 w-3 text-amber-500" />
                                Score: {cert.score}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm space-y-0.5">
                          {cert.issue_date && (
                            <p className="text-muted-foreground text-xs">
                              Issued: {new Date(cert.issue_date).toLocaleDateString()}
                            </p>
                          )}
                          {cert.expiry_date && (
                            <p
                              className={`text-xs font-medium ${
                                new Date(cert.expiry_date) < new Date()
                                  ? "text-red-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {new Date(cert.expiry_date) < new Date()
                                ? "Expired"
                                : "Expires"}
                              : {new Date(cert.expiry_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 rounded-xl bg-muted/20 border border-dashed border-muted-foreground/20">
                  <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                    <Award className="h-7 w-7 text-amber-300" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No certifications on file</p>
                </div>
              )}

              {/* Parsed resume certifications */}
              {latestResume?.parsed_data?.certifications &&
                latestResume.parsed_data.certifications.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded-md bg-sky-100 flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                        </div>
                        <span className="text-sky-700">Extracted from Resume</span>
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {latestResume.parsed_data.certifications.map(
                          (cert, index) => (
                            <div
                              key={index}
                              className="border border-dashed border-sky-200 rounded-xl px-4 py-3 bg-sky-50/30"
                            >
                              <p className="text-sm font-medium">{cert.type}</p>
                              {cert.number && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Hash className="h-2.5 w-2.5" />
                                  {cert.number}
                                </p>
                              )}
                              {cert.score && (
                                <p className="text-xs text-sky-600">
                                  Score: {cert.score}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-violet-50/80 to-purple-50/80 border-b border-violet-100/50">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <span>Skills</span>
                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                    {profile.skills?.length ?? 0} skills listed
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {profile.skills && profile.skills.length > 0 ? (
                <div className="space-y-6">
                  {(["advanced", "intermediate", "basic"] as const).map((level) => {
                    const skillsAtLevel = profile.skills.filter(
                      (s) => s.proficiency === level
                    );
                    if (skillsAtLevel.length === 0) return null;

                    const levelConfig = {
                      advanced: {
                        label: "Advanced",
                        bg: "bg-emerald-100",
                        text: "text-emerald-700",
                        border: "border-emerald-200",
                        dot: "bg-emerald-500",
                        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
                        icon: <Zap className="h-3.5 w-3.5 text-emerald-600" />,
                      },
                      intermediate: {
                        label: "Intermediate",
                        bg: "bg-blue-100",
                        text: "text-blue-700",
                        border: "border-blue-200",
                        dot: "bg-blue-500",
                        badge: "bg-blue-50 text-blue-700 border-blue-200",
                        icon: <TrendingUp className="h-3.5 w-3.5 text-blue-600" />,
                      },
                      basic: {
                        label: "Basic",
                        bg: "bg-slate-100",
                        text: "text-slate-600",
                        border: "border-slate-200",
                        dot: "bg-slate-400",
                        badge: "bg-slate-50 text-slate-600 border-slate-200",
                        icon: <Star className="h-3.5 w-3.5 text-slate-500" />,
                      },
                    };

                    const config = levelConfig[level];

                    return (
                      <div key={level}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`h-6 w-6 rounded-md ${config.bg} flex items-center justify-center`}>
                            {config.icon}
                          </div>
                          <h3 className={`text-sm font-semibold ${config.text}`}>
                            {config.label}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            ({skillsAtLevel.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {skillsAtLevel.map((skill) => (
                            <span
                              key={skill.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.badge}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                              {skill.skill_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 rounded-xl bg-muted/20 border border-dashed border-muted-foreground/20">
                  <div className="h-14 w-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-7 w-7 text-violet-300" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No skills listed</p>
                </div>
              )}

              {/* Parsed resume skills */}
              {latestResume?.parsed_data?.skills &&
                latestResume.parsed_data.skills.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded-md bg-sky-100 flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                        </div>
                        <span className="text-sky-700">Extracted from Resume</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {latestResume.parsed_data.skills.map(
                          (skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-sky-200 bg-sky-50/30 text-sky-700"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resume Tab */}
        <TabsContent value="resume">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-50/80 to-pink-50/80 border-b border-rose-100/50">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="h-9 w-9 rounded-xl bg-rose-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <span>Resume</span>
                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                    Uploaded resume and extracted data
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {latestResume ? (
                <div className="space-y-6">
                  {/* File info */}
                  <div className="flex items-center justify-between flex-wrap gap-4 p-5 rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50/40 to-transparent">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{latestResume.original_filename}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {latestResume.file_type} &middot; Uploaded{" "}
                          {new Date(latestResume.uploaded_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Download className="h-3.5 w-3.5" />
                      Available via storage bucket
                    </div>
                  </div>

                  {/* Parsed Data Summary */}
                  {latestResume.parsed_data && (
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded-md bg-sky-100 flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                        </div>
                        Parsed / Extracted Data
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {latestResume.parsed_data.graduation_year && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50/50 border border-violet-100/50">
                            <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                              <GraduationCap className="h-4 w-4 text-violet-600" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Graduation Year</p>
                              <p className="font-semibold text-sm">{latestResume.parsed_data.graduation_year}</p>
                            </div>
                          </div>
                        )}
                        {latestResume.parsed_data.years_of_experience !== undefined && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                              <Briefcase className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Years of Experience</p>
                              <p className="font-semibold text-sm">{latestResume.parsed_data.years_of_experience}</p>
                            </div>
                          </div>
                        )}
                        {latestResume.parsed_data.salary && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
                            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                              <TrendingUp className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Expected Salary</p>
                              <p className="font-semibold text-sm">{latestResume.parsed_data.salary}</p>
                            </div>
                          </div>
                        )}
                        {latestResume.parsed_data.hospitals &&
                          latestResume.parsed_data.hospitals.length > 0 && (
                            <div className="sm:col-span-2 lg:col-span-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                                <Building2 className="h-3 w-3 text-blue-500" />
                                Hospitals / Facilities Mentioned
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {latestResume.parsed_data.hospitals.map((h, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-600 border-blue-200"
                                  >
                                    <Building2 className="h-2.5 w-2.5 mr-1" />
                                    {h}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Education from parsed data */}
                  {latestResume.parsed_data?.education &&
                    latestResume.parsed_data.education.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                          <div className="h-6 w-6 rounded-md bg-violet-100 flex items-center justify-center">
                            <GraduationCap className="h-3.5 w-3.5 text-violet-600" />
                          </div>
                          Education (from resume)
                        </h3>
                        <div className="space-y-2">
                          {latestResume.parsed_data.education.map(
                            (edu, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 p-3 border border-dashed border-violet-200 rounded-xl bg-violet-50/30"
                              >
                                <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                                  <GraduationCap className="h-4 w-4 text-violet-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {edu.institution || "Unknown Institution"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {edu.degree || "Degree not specified"}
                                    {edu.year ? ` (${edu.year})` : ""}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Extracted text preview */}
                  {latestResume.extracted_text && (
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center">
                          <FileText className="h-3.5 w-3.5 text-slate-600" />
                        </div>
                        Extracted Text Preview
                      </h3>
                      <div className="border rounded-xl p-4 bg-slate-50/50 max-h-60 overflow-y-auto">
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                          {latestResume.extracted_text.substring(0, 2000)}
                          {latestResume.extracted_text.length > 2000 &&
                            "\n\n... (truncated)"}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 rounded-xl bg-muted/20 border border-dashed border-muted-foreground/20">
                  <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-7 w-7 text-rose-300" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No resume uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Metadata Footer */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Hash className="h-3 w-3" />
                Profile: {profile.id.substring(0, 8)}...
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3 w-3" />
                User: {profile.user_id.substring(0, 8)}...
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Updated: {new Date(profile.updated_at).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
