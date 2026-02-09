"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  FileText,
  User,
  Award,
  ArrowRight,
  TrendingUp,
  MapPin,
  Building,
  Clock,
  ChevronRight,
  Sparkles,
  Upload,
  Target,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import type { NurseFullProfile, JobMatch } from "@/types";

export default function NurseDashboard() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<NurseFullProfile | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const profileRes = await fetch("/api/nurses/me");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        const matchRes = await fetch("/api/jobs/match");
        if (matchRes.ok) {
          const matchData = await matchRes.json();
          setMatches(matchData.matches || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const profileCompleteness = calculateCompleteness(profile);
  const topMatches = matches.slice(0, 5);

  return (
    <div>
      {/* Dashboard Header - Full Width Edge-to-Edge (Same as Profile) */}
      <div className="profile-header">
        {/* Subtle Decorative Elements */}
        <div className="profile-header-bg">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="profile-header-container">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Welcome Section */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-sky-100 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-sky-600" />
                    </div>
                    <span className="text-sm text-white/90 font-medium">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  
                  <h1 className="text-4xl font-bold text-white mb-3">
                    Welcome back, {profile?.first_name || "Nurse"}!
                  </h1>
                  {profile?.bio ? (
                    <p className="text-gray-900 text-base leading-relaxed line-clamp-4 max-w-3xl">
                      {profile.bio}
                    </p>
                  ) : (
                    <p className="text-gray-700 text-base italic">
                      Complete your profile to start getting matched with great opportunities.
                    </p>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    asChild
                    className="profile-btn-primary hidden sm:inline-flex"
                  >
                    <Link href="/jobs">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Browse Jobs
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="profile-btn-outline hidden sm:inline-flex"
                  >
                    <Link href="/profile">
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  
                  {/* Mobile icon buttons */}
                  <div className="flex sm:hidden gap-2">
                    <Button
                      asChild
                      size="icon"
                      className="h-10 w-10 bg-primary text-primary-foreground rounded-lg shadow-sm"
                    >
                      <Link href="/jobs">
                        <Briefcase className="h-5 w-5" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="icon"
                      className="h-10 w-10 bg-white text-primary border border-primary rounded-lg shadow-sm"
                    >
                      <Link href="/profile">
                        <User className="h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Overlapping Header (Same as Profile) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 -mt-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="stats-card">
             <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="stats-icon-blue">
                  <User />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{profileCompleteness}%</p>
                  <p className="text-sm text-gray-600">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
             <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="stats-icon-orange">
                  <Briefcase />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{profile?.years_of_experience || 0}</p>
                  <p className="text-sm text-gray-600">Experience</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
             <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="stats-icon-purple">
                  <Award />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{profile?.certifications?.length || 0}</p>
                  <p className="text-sm text-gray-600">Certifications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
             <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="stats-icon-green">
                  <Target />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{matches.length}</p>
                  <p className="text-sm text-gray-600">Matches</p>
                </div>
              </div>
            </CardContent>
           </Card>
        </div>
      </div>

      {/* Enhanced Profile Completeness Alert */}
      {profileCompleteness < 100 && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 mb-8">
          <Card className="section-card border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <CardContent className="py-7 px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-1">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your profile is <span className="font-semibold">{profileCompleteness}% complete</span>. Profiles completed earn 3× more matches and 5× more interviews.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getIncompleteFields(profile).map((field, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button size="lg" className="profile-btn-primary flex-shrink-0 shadow-md hover:shadow-lg" asChild>
                  <Link href="/profile">
                    Complete Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-16">
        {/* Enhanced Job Matches Section */}
        <div className="lg:col-span-2 space-y-4">
           <Card className="section-card">
            <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40 flex flex-row items-center justify-between space-y-0 rounded-t-lg overflow-hidden">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="section-icon-purple">
                  <Target />
                </div>
                Top Job Matches
              </CardTitle>
               {matches.length > 3 && (
                 <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                   <Link href="/jobs" className="flex items-center">
                     View All {matches.length}
                     <ChevronRight className="h-4 w-4 ml-1" />
                   </Link>
                 </Button>
               )}
            </CardHeader>
            <CardContent>
              {topMatches.length === 0 ? (
                 <div className="text-center py-8 sm:py-12 px-3 sm:px-4">
                  <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No job matches yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                    Complete your profile to unlock personalized job recommendations tailored to your skills and experience.
                  </p>
                   <Button asChild className="profile-btn-primary">
                    <Link href="/profile">
                      Complete Your Profile
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              ) : (
                 <div className="space-y-3">
                   {topMatches.map((match) => (
                    <Link key={match.job.id} href={`/jobs/${match.job.id}`}>
                    <div
                       className="relative group border rounded-2xl p-4 sm:p-5 hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Job Title & Company */}
                          <div>
                            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors truncate">
                              {match.job.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Building className="h-4 w-4" />
                                {match.job.facility_name}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {match.job.location}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {match.job.employment_type}
                              </span>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {match.matched_certifications.slice(0, 3).map((cert) => (
                              <Badge key={cert} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {cert}
                              </Badge>
                            ))}
                             {match.matched_skills.slice(0, 2).map((skill) => (
                               <div key={skill} className="skill-badge">
                                 {skill}
                               </div>
                             ))}
                            {(match.matched_certifications.length > 3 || match.matched_skills.length > 2) && (
                              <Badge variant="outline" className="border-dashed">
                                +{(match.matched_certifications.length - 3) + (match.matched_skills.length - 2)} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Match Score */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
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

                      {/* Hover Arrow Indicator */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card className="section-card">
            <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40 flex flex-row items-center justify-between space-y-0 rounded-t-lg overflow-hidden">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="section-icon">
                  <Sparkles />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/profile"
                className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-muted transition-all duration-200 group"
              >
                <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors shadow-sm">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-0.5">Edit Profile</p>
                  <p className="text-xs text-muted-foreground">Update your information</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-muted transition-all duration-200 group"
              >
                <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors shadow-sm">
                  <Upload className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-0.5">Upload Resume</p>
                  <p className="text-xs text-muted-foreground">Add or update resume</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href="/jobs"
                className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-muted transition-all duration-200 group"
              >
                <div className="h-11 w-11 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors shadow-sm">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-0.5">Browse Jobs</p>
                  <p className="text-xs text-muted-foreground">Explore opportunities</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </CardContent>
          </Card>

          {/* Enhanced Profile Summary */}
          <Card className="section-card">
            <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40 flex flex-row items-center justify-between space-y-0 rounded-t-lg overflow-hidden">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="section-icon-orange">
                  <Award />
                </div>
                Profile Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Certifications */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Certifications
                  </p>
                  {profile?.certifications && profile.certifications.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {profile.certifications.length}
                    </Badge>
                  )}
                </div>
                {profile?.certifications && profile.certifications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications.map((cert) => (
                      <Badge 
                        key={cert.id} 
                        className={cert.verified ? "bg-emerald-100 text-emerald-700 border-0" : ""}
                        variant={cert.verified ? "default" : "secondary"}
                      >
                        {cert.verified && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {cert.cert_type}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 text-center">
                    No certifications added
                  </p>
                )}
              </div>

              {/* Skills */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Top Skills
                  </p>
                  {profile?.skills && profile.skills.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {profile.skills.length}
                    </Badge>
                  )}
                </div>
                {profile?.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                     {profile.skills.slice(0, 8).map((skill) => (
                       <div key={skill.id} className="skill-badge">
                         {skill.skill_name}
                       </div>
                     ))}
                    {profile.skills.length > 8 && (
                      <Badge variant="outline" className="border-dashed">
                        +{profile.skills.length - 8} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 text-center">
                    No skills added
                  </p>
                )}
              </div>

              {/* Resume */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Resume
                </p>
                {profile?.resumes && profile.resumes.length > 0 ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {profile.resumes[0].original_filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded resume
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-muted/50 border border-dashed border-muted-foreground/30 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">No resume uploaded</p>
                     <Button size="sm" className="profile-btn-outline" asChild>
                       <Link href="/profile">
                         Upload Now
                       </Link>
                     </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function calculateCompleteness(profile: NurseFullProfile | null): number {
  if (!profile) return 0;

  let filled = 0;
  const total = 8;

  if (profile.first_name && profile.last_name) filled++;
  if (profile.phone) filled++;
  if (profile.address && profile.city) filled++;
  if (profile.date_of_birth) filled++;
  if (profile.graduation_year) filled++;
  if (profile.experience && profile.experience.length > 0) filled++;
  if (profile.certifications && profile.certifications.length > 0) filled++;
  if (profile.resumes && profile.resumes.length > 0) filled++;

  return Math.round((filled / total) * 100);
}

function getIncompleteFields(profile: NurseFullProfile | null): string[] {
  if (!profile) return [];
  
  const incomplete: string[] = [];
  
  if (!profile.first_name || !profile.last_name) incomplete.push("Name");
  if (!profile.phone) incomplete.push("Phone");
  if (!profile.address || !profile.city) incomplete.push("Location");
  if (!profile.date_of_birth) incomplete.push("Date of Birth");
  if (!profile.graduation_year) incomplete.push("Graduation Year");
  if (!profile.experience || profile.experience.length === 0) incomplete.push("Experience");
  if (!profile.certifications || profile.certifications.length === 0) incomplete.push("Certifications");
  if (!profile.resumes || profile.resumes.length === 0) incomplete.push("Resume");
  
  return incomplete;
}
