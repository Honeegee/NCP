"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  AlertCircle,
  User,
  Briefcase,
  Award,
  GraduationCap,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  FileText,
  Building2,
  Activity,
  FileCheck,
  Eye,
  Download,
  Target,
} from "lucide-react";
import type { NurseFullProfile } from "@/types";
import { formatNurseName } from "@/lib/utils";

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
          if (res.status === 404) throw new Error("Nurse profile not found");
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


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="font-semibold">{error || "Nurse profile not found"}</p>
            </div>
            <Link href="/admin/nurses">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Nurses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = `${(profile.first_name || "N")[0]}${(profile.last_name || "U")[0]}`.toUpperCase();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const fields = [
    profile.first_name,
    profile.last_name,
    profile.phone,
    profile.city,
    profile.country,
    profile.bio,
  ];
  const filledFields = fields.filter(Boolean).length;
  const completionPercent = Math.round((filledFields / fields.length) * 100);

  return (
    <div className="-mt-8 -mx-4">
      {/* Back navigation */}
      <div className="mb-2 px-3 sm:px-6">
        <Link
          href="/admin/nurses"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Nurses
        </Link>
      </div>

      {/* Profile Header - Blue Background */}
      <div className="profile-header">
        <div className="profile-header-bg">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 -mt-26 relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {profile.profile_picture_url ? (
              <div
                className="profile-picture relative"
                style={{ height: "12rem", width: "12rem" }}
              >
                <Image
                  src={profile.profile_picture_url}
                  alt={formatNurseName(
                    profile.first_name,
                    profile.last_name,
                    profile.professional_status
                  )}
                  fill
                  sizes="192px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div
                className="profile-picture flex items-center justify-center text-3xl sm:text-5xl font-bold text-sky-600"
                style={{ height: "12rem", width: "12rem" }}
              >
                {initials}
              </div>
            )}
            <div className="profile-picture-verified">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 flex items-center w-full">
            <div className="w-full">
              <div className="mb-3">
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2 text-center sm:text-left">
                  {formatNurseName(
                    profile.first_name,
                    profile.last_name,
                    profile.professional_status
                  )}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm mb-3">
                  {(profile.city || profile.country) && (
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-600" />
                      <span>
                        {profile.city}
                        {profile.city && profile.country ? ", " : ""}
                        {profile.country}
                      </span>
                    </span>
                  )}
                  {profile.user?.email && (
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-sky-600" />
                      <span>{profile.user.email}</span>
                    </span>
                  )}
                  {profile.phone && (
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-sky-600" />
                      <span>{profile.phone}</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                {profile.bio ? (
                  <p className="text-sm leading-relaxed text-gray-700">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No professional summary added.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex justify-end mb-3">
          <Link href={`/admin/nurses/${nurseId}/matches`}>
            <Button variant="outline" size="sm">
              <Target className="h-3.5 w-3.5 mr-1" />
              View Matches
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="stats-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="stats-icon-blue">
                  <Briefcase />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {profile.experience?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Experience</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="stats-icon-orange">
                  <Award />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {profile.certifications?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Certifications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="stats-icon-purple">
                  <Sparkles />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {profile.skills?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Skills</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="stats-icon-green">
                  <User />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {completionPercent}%
                  </p>
                  <p className="text-sm text-gray-600">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Experience */}
            <Card className="section-card">
              <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40 rounded-t-lg overflow-hidden">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="h-9 w-9 rounded-xl bg-sky-100 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <span>Experience</span>
                    <p className="text-sm font-normal text-muted-foreground mt-0.5">
                      {profile.years_of_experience ?? 0} years total experience
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {profile.experience && profile.experience.length > 0 ? (
                  <div className="space-y-0">
                    {profile.experience
                      .sort((a, b) => {
                        const dateA = new Date(a.start_date || "1900-01-01");
                        const dateB = new Date(b.start_date || "1900-01-01");
                        return dateB.getTime() - dateA.getTime();
                      })
                      .map((exp, index) => (
                        <div
                          key={exp.id}
                          className={`flex items-start gap-3 py-4 ${
                            index !== 0 ? "border-t border-border/50" : ""
                          }`}
                        >
                          <div className="h-9 w-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Building2 className="h-4 w-4 text-sky-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground">
                                  {exp.position}
                                </p>
                                <p className="text-sm text-sky-600 font-medium mt-0.5">
                                  {exp.employer}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {exp.department && exp.department}
                                  {exp.department && exp.location && " · "}
                                  {exp.location && exp.location}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="bg-sky-50 text-sky-600 border-sky-200 text-xs font-normal flex-shrink-0"
                              >
                                {formatDate(exp.start_date)} –{" "}
                                {exp.end_date
                                  ? formatDate(exp.end_date)
                                  : "Present"}
                              </Badge>
                            </div>
                            {exp.description && (
                              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No experience added</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="section-card">
              <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40 rounded-t-lg overflow-hidden">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="h-9 w-9 rounded-xl bg-sky-100 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <span>Education</span>
                    <p className="text-sm font-normal text-muted-foreground mt-0.5">
                      {profile.education?.length ?? 0}{" "}
                      {profile.education?.length === 1 ? "record" : "records"}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {profile.education && profile.education.length > 0 ? (
                  <div className="space-y-0">
                    {profile.education
                      .sort((a, b) => {
                        const yearA =
                          a.graduation_year ||
                          new Date(a.end_date || "1900-01-01").getFullYear();
                        const yearB =
                          b.graduation_year ||
                          new Date(b.end_date || "1900-01-01").getFullYear();
                        return yearB - yearA;
                      })
                      .map((edu, index) => (
                        <div
                          key={edu.id}
                          className={`flex items-start gap-3 py-4 ${
                            index !== 0 ? "border-t border-border/50" : ""
                          }`}
                        >
                          <div className="h-9 w-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <GraduationCap className="h-4 w-4 text-sky-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground">
                                  {edu.institution}
                                </p>
                                <p className="text-sm text-sky-600 font-medium mt-0.5">
                                  {edu.degree}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {edu.field_of_study && edu.field_of_study}
                                  {edu.field_of_study &&
                                    edu.institution_location &&
                                    " · "}
                                  {edu.institution_location &&
                                    edu.institution_location}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="bg-sky-50 text-sky-600 border-sky-200 text-xs font-normal flex-shrink-0"
                              >
                                {edu.start_date || edu.end_date ? (
                                  <>
                                    {edu.start_date &&
                                      new Date(edu.start_date).getFullYear()}
                                    {edu.start_date && "–"}
                                    {edu.end_date
                                      ? new Date(edu.end_date).getFullYear()
                                      : "Present"}
                                  </>
                                ) : edu.graduation_year ? (
                                  `Grad. ${edu.graduation_year}`
                                ) : (
                                  "Present"
                                )}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No education added</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="section-card">
              <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40 rounded-t-lg overflow-hidden">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="h-9 w-9 rounded-xl bg-sky-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-sky-500" />
                  </div>
                  <div>
                    <span>Skills</span>
                    <p className="text-sm font-normal text-muted-foreground mt-0.5">
                      {profile.skills?.length ?? 0}{" "}
                      {profile.skills?.length === 1 ? "skill" : "skills"} listed
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span key={skill.id} className="skill-badge">
                        {skill.skill_name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No skills added</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Profile Strength */}
            <Card className="section-card overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="h-9 w-9 rounded-xl bg-sky-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-sky-600" />
                  </div>
                  <span>Profile Strength</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="font-bold text-base">
                        {completionPercent < 50
                          ? "Beginner"
                          : completionPercent < 80
                          ? "Intermediate"
                          : "All-star"}
                      </span>
                      <span className="font-bold text-lg">
                        {completionPercent}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={
                          completionPercent < 50
                            ? "progress-bar-fill-low"
                            : completionPercent < 80
                            ? "progress-bar-fill-medium"
                            : "progress-bar-fill-high"
                        }
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="section-card">
              <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40 rounded-t-lg overflow-hidden">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="h-9 w-9 rounded-xl bg-sky-100 flex items-center justify-center">
                    <Award className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <span>Certifications</span>
                    <p className="text-sm font-normal text-muted-foreground mt-0.5">
                      {profile.certifications?.length ?? 0} total
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {profile.certifications && profile.certifications.length > 0 ? (
                  <div className="space-y-4">
                    {profile.certifications.map((cert, index) => (
                      <div
                        key={cert.id}
                        className={`flex items-start gap-3 ${
                          index !== 0 ? "border-t border-border/50 pt-4" : ""
                        }`}
                      >
                        <div className="h-8 w-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Award className="h-4 w-4 text-sky-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {cert.cert_type}
                          </p>
                          {cert.cert_number && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              #{cert.cert_number}
                            </p>
                          )}
                          {cert.score && (
                            <p className="text-xs text-muted-foreground">
                              Score: {cert.score}
                            </p>
                          )}
                          {cert.verified && (
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No certifications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resume */}
            <Card className="section-card overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="h-9 w-9 rounded-xl bg-sky-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-sky-600" />
                  </div>
                  <span>Resume</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {profile.resumes && profile.resumes.length > 0 ? (
                  <div className="space-y-2">
                    {profile.resumes.map((resume) => (
                      <div
                        key={resume.id}
                        className="flex items-center gap-2 p-2 rounded bg-muted text-sm"
                      >
                        <FileCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {resume.original_filename}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(resume.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <ResumeActions resumeId={resume.id} filename={resume.original_filename} fileType={resume.file_type} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No resume uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}

function ResumeActions({
  resumeId,
  filename,
  fileType,
}: {
  resumeId: string;
  filename: string;
  fileType: string;
}) {
  const isPdf = fileType === "pdf";

  const getSignedUrl = async () => {
    const res = await fetch(`/api/resume/${resumeId}`);
    if (!res.ok) throw new Error("Failed to get resume URL");
    const data = await res.json();
    return data.url as string;
  };

  const handleView = async () => {
    try {
      const url = await getSignedUrl();
      window.open(url, "_blank");
    } catch {
      alert("Could not open resume.");
    }
  };

  const handleDownload = async () => {
    try {
      const url = await getSignedUrl();
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
    } catch {
      alert("Could not download resume.");
    }
  };

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {isPdf && (
        <button
          onClick={handleView}
          title="View"
          className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        onClick={handleDownload}
        title="Download"
        className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
