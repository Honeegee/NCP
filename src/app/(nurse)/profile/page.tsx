"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  User,
  Briefcase,
  Award,
  GraduationCap,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  FileCheck,
  Edit2,
  Building2,
  Plus,
  Trash2,
  Activity,
  MoreVertical,
  Eye,
  Download,
} from "lucide-react";
import type { NurseFullProfile, NurseExperience, NurseEducation, NurseSkill, NurseCertification } from "@/types";
import ExperienceModal from "@/components/profile/modals/ExperienceModal";
import EducationModal from "@/components/profile/modals/EducationModal";
import SkillsModal from "@/components/profile/modals/SkillsModal";
import CertificationsModal from "@/components/profile/modals/CertificationsModal";
import ProfileEditModal from "@/components/profile/modals/ProfileEditModal";
import { formatNurseName } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<NurseFullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [profileEditModalOpen, setProfileEditModalOpen] = useState(false);

  // Experience modal
  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<NurseExperience | null>(null);

  // Education modal
  const [educationModalOpen, setEducationModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<NurseEducation | null>(null);

  // Skills modal
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<NurseSkill | null>(null);

  // Certifications modal
  const [certificationsModalOpen, setCertificationsModalOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<NurseCertification | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/nurses/me");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session, fetchProfile]);

  const handleSaveProfile = async (data: {
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    graduation_year: number | null;
    bio: string;
    professional_status: "registered_nurse" | "nursing_student" | null;
  }) => {
    if (!profile) return;
    const res = await fetch(`/api/nurses/${profile.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Profile updated successfully!");
      setProfileEditModalOpen(false);
      fetchProfile();
    } else {
      const json = await res.json();
      toast.error(json.error || "Failed to update profile");
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (profile.resumes && profile.resumes.length > 0) {
      if (!confirm("This will replace your existing resume. Continue?")) {
        e.target.value = "";
        return;
      }
    }

    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("profile_id", profile.id);

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (res.ok) {
        const msg = data.warning
          ? `Resume saved. Warning: ${data.warning}`
          : data.parsed_data
          ? "Resume uploaded and data extracted!"
          : "Resume saved (no data could be extracted).";
        toast.success(msg);
        fetchProfile();
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const getResumeUrl = async (resumeId: string) => {
    const res = await fetch(`/api/resume/${resumeId}`);
    if (!res.ok) throw new Error("Failed to get resume URL");
    const data = await res.json();
    return data as { url: string; filename: string };
  };

  const handleViewResume = async (resumeId: string) => {
    try {
      const { url } = await getResumeUrl(resumeId);
      window.open(url, "_blank");
    } catch {
      toast.error("Could not open resume.");
    }
  };

  const handleDownloadResume = async (resumeId: string, filename: string) => {
    try {
      const { url } = await getResumeUrl(resumeId);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
    } catch {
      toast.error("Could not download resume.");
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm("Delete this resume? This won't remove data already extracted from it.")) return;

    try {
      const res = await fetch(`/api/resume/${resumeId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Resume deleted.");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete resume");
      }
    } catch {
      toast.error("Failed to delete resume");
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploadingPicture(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("profile_id", profile.id);

    try {
      const res = await fetch("/api/nurses/profile-picture", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Profile picture updated!");
        fetchProfile();
        await update();
        router.refresh();
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingPicture(false);
      e.target.value = "";
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!profile || !profile.profile_picture_url) return;
    
    if (!confirm("Delete your profile picture?")) return;

    setUploadingPicture(true);

    try {
      const res = await fetch(`/api/nurses/profile-picture?profile_id=${profile.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Profile picture deleted!");
        fetchProfile();
        await update();
        router.refresh();
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setUploadingPicture(false);
    }
  };

  // Experience functions
  const handleOpenExperienceModal = (exp?: NurseExperience) => {
    if (exp) {
      setEditingExperience(exp);
    } else {
      setEditingExperience(null);
    }
    setExperienceModalOpen(true);
  };

  const handleSaveExperience = async (data: {
    employer: string;
    position: string;
    department: string;
    start_date: string;
    end_date: string;
    description: string;
  }) => {
    if (!profile) return;
    try {
      const url = editingExperience
        ? `/api/nurses/experience/${editingExperience.id}`
        : "/api/nurses/experience";
      const method = editingExperience ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success(editingExperience ? "Experience updated!" : "Experience added!");
        setExperienceModalOpen(false);
        fetchProfile();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save experience");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm("Delete this experience?")) return;
    try {
      const res = await fetch(`/api/nurses/experience/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Experience deleted!");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete experience");
      }
    } catch {
      toast.error("Failed to delete experience");
    }
  };

  // Education functions
  const handleOpenEducationModal = (edu?: NurseEducation) => {
    if (edu) {
      setEditingEducation(edu);
    } else {
      setEditingEducation(null);
    }
    setEducationModalOpen(true);
  };

  const handleSaveEducation = async (data: {
    institution: string;
    degree: string;
    field_of_study: string;
    graduation_year: string;
  }) => {
    if (!profile) return;
    try {
      const url = editingEducation
        ? `/api/nurses/education/${editingEducation.id}`
        : "/api/nurses/education";
      const method = editingEducation ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          // Keep "Present" as string, API will handle conversion to null
          graduation_year: data.graduation_year,
        }),
      });
      if (res.ok) {
        toast.success(editingEducation ? "Education updated!" : "Education added!");
        setEducationModalOpen(false);
        fetchProfile();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save education");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (!confirm("Delete this education?")) return;
    try {
      const res = await fetch(`/api/nurses/education/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Education deleted!");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete education");
      }
    } catch {
      toast.error("Failed to delete education");
    }
  };

  // Skills functions
  const handleOpenSkillsModal = (skill?: NurseSkill) => {
    if (skill) {
      setEditingSkill(skill);
    } else {
      setEditingSkill(null);
    }
    setSkillsModalOpen(true);
  };

  const handleSaveSkill = async (data: { skill_name: string }) => {
    if (!profile) return;
    try {
      const url = editingSkill
        ? `/api/nurses/skills/${editingSkill.id}`
        : "/api/nurses/skills";
      const method = editingSkill ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill_name: data.skill_name,
          proficiency: "basic",
        }),
      });
      if (res.ok) {
        toast.success(editingSkill ? "Skill updated!" : "Skill added!");
        setSkillsModalOpen(false);
        fetchProfile();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save skill");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    try {
      const res = await fetch(`/api/nurses/skills/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Skill deleted!");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete skill");
      }
    } catch {
      toast.error("Failed to delete skill");
    }
  };

  // Certifications functions
  const handleOpenCertificationsModal = (cert?: NurseCertification) => {
    if (cert) {
      setEditingCertification(cert);
    } else {
      setEditingCertification(null);
    }
    setCertificationsModalOpen(true);
  };

  const handleSaveCertification = async (data: {
    cert_type: string;
    cert_number: string;
    score: string;
    issue_date: string;
    expiry_date: string;
    verified: boolean;
  }) => {
    if (!profile) return;
    try {
      const url = editingCertification
        ? `/api/nurses/certifications/${editingCertification.id}`
        : "/api/nurses/certifications";
      const method = editingCertification ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success(editingCertification ? "Certification updated!" : "Certification added!");
        setCertificationsModalOpen(false);
        fetchProfile();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save certification");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteCertification = async (id: string) => {
    if (!confirm("Delete this certification?")) return;
    try {
      const res = await fetch(`/api/nurses/certifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Certification deleted!");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete certification");
      }
    } catch {
      toast.error("Failed to delete certification");
    }
  };

  // Clear all functions
  const handleClearAllExperience = async () => {
    if (!confirm("Delete ALL experience entries? This action cannot be undone.")) return;
    try {
      const res = await fetch("/api/nurses/experience/clear", { method: "DELETE" });
      if (res.ok) {
        toast.success("All experience entries deleted!");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to clear experience");
      }
    } catch {
      toast.error("Failed to clear experience");
    }
  };

  const handleClearAllEducation = async () => {
    if (!confirm("Delete ALL education entries? This action cannot be undone.")) return;
    try {
      const res = await fetch("/api/nurses/education/clear", { method: "DELETE" });
      if (res.ok) {
        toast.success("All education entries deleted!");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to clear education");
      }
    } catch {
      toast.error("Failed to clear education");
    }
  };

  const handleClearAllSkills = async () => {
    if (!confirm("Delete ALL skills? This action cannot be undone.")) return;
    try {
      const res = await fetch("/api/nurses/skills/clear", { method: "DELETE" });
      if (res.ok) {
        toast.success("All skills deleted!");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to clear skills");
      }
    } catch {
      toast.error("Failed to clear skills");
    }
  };

  const handleClearAllCertifications = async () => {
    if (!confirm("Delete ALL certifications? This action cannot be undone.")) return;
    try {
      const res = await fetch("/api/nurses/certifications/clear", { method: "DELETE" });
      if (res.ok) {
        toast.success("All certifications deleted!");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to clear certifications");
      }
    } catch {
      toast.error("Failed to clear certifications");
    }
  };

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

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  const initials = `${(profile.first_name || "N")[0]}${(profile.last_name || "U")[0]}`.toUpperCase();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  // Calculate profile completeness
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
    <div>
       {/* Profile Header - Blue Background */}
       <div className="profile-header">
         <div className="profile-header-bg">
           <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl"></div>
           <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
         </div>
       </div>

      {/* Profile Info Section - Overlapping between blue and white */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 -mt-26 relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8">
          {/* Avatar - centered on mobile, left on desktop */}
          <div className="relative group flex-shrink-0">
            {profile.profile_picture_url ? (
              <div className="profile-picture relative" style={{ height: '12rem', width: '12rem' }}>
                 <Image
                   src={profile.profile_picture_url}
                   alt={formatNurseName(profile.first_name, profile.last_name, profile.professional_status)}
                   fill
                   sizes="192px"
                   className="object-cover"
                   priority
                 />
              </div>
            ) : (
              <div className="profile-picture flex items-center justify-center text-3xl sm:text-5xl font-bold text-sky-600" style={{ height: '12rem', width: '12rem' }}>
                {initials}
              </div>
            )}
            <div className="profile-picture-verified">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>

            {/* Profile Picture Actions */}
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                  disabled={uploadingPicture}
                />
                <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-md">
                  {uploadingPicture ? (
                    <div className="h-4 w-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5 text-sky-600" />
                  )}
                </div>
              </label>
              {profile.profile_picture_url && (
                <button
                  onClick={handleDeleteProfilePicture}
                  disabled={uploadingPicture}
                  className="h-10 w-10 rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-md"
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </button>
              )}
            </div>
          </div>

          {/* Profile Info - centered on mobile, left-aligned on desktop */}
          <div className="flex-1 flex items-center w-full">
            <div className="w-full">
              <div className="flex justify-between items-start mb-3 group">
                <div className="flex-1">
                 <h2 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2 text-center sm:text-left">
                   {formatNurseName(profile.first_name, profile.last_name, profile.professional_status)}
                 </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm mb-3">
                    {(profile.city || profile.country) && (
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-600" />
                        <span>{profile.city}{profile.city && profile.country ? ", " : ""}{profile.country}</span>
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
                <Button variant="ghost" size="sm" onClick={() => setProfileEditModalOpen(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div>
                {profile.bio ? (
                  <p className="text-sm leading-relaxed text-gray-700 line-clamp-3 sm:line-clamp-none">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No professional summary added yet. Click edit to add one.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="stats-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="stats-icon-blue">
                  <Briefcase />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{profile.experience?.length || 0}</p>
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
                  <p className="text-2xl font-bold text-gray-800">{profile.certifications?.length || 0}</p>
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
                  <p className="text-2xl font-bold text-gray-800">{profile.skills?.length || 0}</p>
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
                  <p className="text-2xl font-bold text-gray-800">{completionPercent}%</p>
                  <p className="text-sm text-gray-600">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">

          {/* Experience Section */}
          <Card className="section-card">
            <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40 flex flex-row items-center justify-between space-y-0 group rounded-t-lg overflow-hidden">
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
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {profile.experience && profile.experience.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearAllExperience} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleOpenExperienceModal()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {profile.experience && profile.experience.length > 0 ? (
                <div className="space-y-0">
                    {profile.experience
                      .sort((a, b) => {
                        const dateA = new Date(a.start_date || '1900-01-01');
                        const dateB = new Date(b.start_date || '1900-01-01');
                        return dateB.getTime() - dateA.getTime();
                      })
                      .map((exp, index) => (
                      <div key={exp.id} className={`group flex items-start gap-3 py-4 ${index !== 0 ? "border-t border-border/50" : ""}`}>
                        <div className="h-9 w-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Building2 className="h-4 w-4 text-sky-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground">{exp.position}</p>
                              <p className="text-sm text-sky-600 font-medium mt-0.5">{exp.employer}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {exp.department && exp.department}{exp.department && exp.location && " · "}{exp.location && exp.location}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Badge variant="outline" className="bg-sky-50 text-sky-600 border-sky-200 text-xs font-normal">
                                {formatDate(exp.start_date)} – {exp.end_date ? formatDate(exp.end_date) : "Present"}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger className="h-7 w-7 p-0 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted flex items-center justify-center transition-opacity">
                                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpenExperienceModal(exp)}>
                                    <Edit2 className="h-3.5 w-3.5 mr-2" />Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteExperience(exp.id)} className="text-red-600 focus:text-red-600">
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No experience added</p>
                  <p className="text-xs opacity-70 mt-0.5">Upload your resume to auto-populate</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education Section */}
          <Card className="section-card mt-6">
            <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40 flex flex-row items-center justify-between space-y-0 group rounded-t-lg overflow-hidden">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="h-9 w-9 rounded-xl bg-sky-100 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <span>Education</span>
                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                    {profile.education?.length ?? 0} {profile.education?.length === 1 ? "record" : "records"}
                  </p>
                </div>
              </CardTitle>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {profile.education && profile.education.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearAllEducation} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleOpenEducationModal()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {profile.education && profile.education.length > 0 ? (
                <div className="space-y-0">
                    {profile.education
                      .sort((a, b) => {
                        const yearA = a.graduation_year || new Date(a.end_date || '1900-01-01').getFullYear();
                        const yearB = b.graduation_year || new Date(b.end_date || '1900-01-01').getFullYear();
                        return yearB - yearA;
                      })
                      .map((edu, index) => (
                      <div key={edu.id} className={`group flex items-start gap-3 py-4 ${index !== 0 ? "border-t border-border/50" : ""}`}>
                        <div className="h-9 w-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <GraduationCap className="h-4 w-4 text-sky-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground">{edu.institution}</p>
                              <p className="text-sm text-sky-600 font-medium mt-0.5">{edu.degree}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {edu.field_of_study && edu.field_of_study}{edu.field_of_study && edu.institution_location && " · "}{edu.institution_location && edu.institution_location}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Badge variant="outline" className="bg-sky-50 text-sky-600 border-sky-200 text-xs font-normal">
                                {(edu.start_date || edu.end_date) ? (
                                  <>{edu.start_date && new Date(edu.start_date).getFullYear()}{edu.start_date && '–'}{edu.end_date ? new Date(edu.end_date).getFullYear() : 'Present'}</>
                                ) : edu.graduation_year ? `Grad. ${edu.graduation_year}` : 'Present'}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger className="h-7 w-7 p-0 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted flex items-center justify-center transition-opacity">
                                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpenEducationModal(edu)}>
                                    <Edit2 className="h-3.5 w-3.5 mr-2" />Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteEducation(edu.id)} className="text-red-600 focus:text-red-600">
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No education added</p>
                  <p className="text-xs opacity-70 mt-0.5">Upload your resume to auto-populate</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card className="section-card mt-6">
            <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40 flex flex-row items-center justify-between space-y-0 group rounded-t-lg overflow-hidden">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="h-9 w-9 rounded-xl bg-sky-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <span>Skills</span>
                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                    {profile.skills?.length ?? 0} {profile.skills?.length === 1 ? "skill" : "skills"} listed
                  </p>
                </div>
              </CardTitle>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {profile.skills && profile.skills.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearAllSkills} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleOpenSkillsModal()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="skill-badge group relative cursor-pointer"
                      onClick={() => handleOpenSkillsModal(skill)}
                    >
                      {skill.skill_name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSkill(skill.id);
                        }}
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete skill"
                      >
                        <svg className="h-3 w-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No skills added</p>
                  <p className="text-xs opacity-70 mt-0.5">Upload your resume to auto-populate</p>
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
                      {completionPercent < 50 ? "Beginner" : completionPercent < 80 ? "Intermediate" : "All-star"}
                    </span>
                    <span className="font-bold text-lg">{completionPercent}%</span>
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
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Improve your profile:</p>
                  {!profile.bio && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5" />
                      <span>Add a professional summary</span>
                    </div>
                  )}
                  {!profile.phone && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5" />
                      <span>Add contact information</span>
                    </div>
                  )}
                  {(!profile.experience || profile.experience.length === 0) && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5" />
                      <span>Add work experience</span>
                    </div>
                  )}
                  {(!profile.skills || profile.skills.length === 0) && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5" />
                      <span>List your skills</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card className="section-card mt-6">
            <CardHeader className="bg-gradient-to-r from-sky-50/60 to-blue-50/30 border-b border-sky-100/40 flex flex-row items-center justify-between space-y-0 group rounded-t-lg overflow-hidden">
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
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {profile.certifications && profile.certifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearAllCertifications} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleOpenCertificationsModal()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {profile.certifications && profile.certifications.length > 0 ? (
                <div className="space-y-4">
                  {profile.certifications.map((cert, index) => (
                    <div key={cert.id} className={`group flex items-start justify-between gap-2 ${index !== 0 ? "border-t border-border/50 pt-4" : ""}`}>
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Award className="h-4 w-4 text-sky-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{cert.cert_type}</p>
                          {cert.verified && (
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5">
                              <CheckCircle className="h-3 w-3" />Verified
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-7 w-7 p-0 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted flex items-center justify-center transition-opacity">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenCertificationsModal(cert)}>
                            <Edit2 className="h-3.5 w-3.5 mr-2" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteCertification(cert.id)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

          {/* Resume Upload */}
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
              <div className="space-y-3">
                <label className="block">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary hover:bg-accent transition-colors cursor-pointer">
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Processing...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium">Upload Resume</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF or Word format</p>
                      </>
                    )}
                  </div>
                </label>

                {profile.resumes && profile.resumes.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {profile.resumes.map((resume) => (
                      <div
                        key={resume.id}
                        className="flex items-center gap-2 p-2 rounded bg-muted text-sm group"
                      >
                        <FileCheck className="h-4 w-4 text-success flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {resume.original_filename}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(resume.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        {resume.file_type === "pdf" && (
                          <button
                            onClick={() => handleViewResume(resume.id)}
                            className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                            title="View resume"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadResume(resume.id, resume.original_filename)}
                          className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                          title="Download resume"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteResume(resume.id)}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete resume"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>

      {/* Experience Modal */}
      <ExperienceModal
        open={experienceModalOpen}
        onOpenChange={setExperienceModalOpen}
        experience={editingExperience}
        onSave={handleSaveExperience}
      />

      {/* Education Modal */}
      <EducationModal
        open={educationModalOpen}
        onOpenChange={setEducationModalOpen}
        education={editingEducation}
        onSave={handleSaveEducation}
      />

      {/* Skills Modal */}
      <SkillsModal
        open={skillsModalOpen}
        onOpenChange={setSkillsModalOpen}
        skill={editingSkill}
        onSave={handleSaveSkill}
      />

      {/* Certifications Modal */}
      <CertificationsModal
        open={certificationsModalOpen}
        onOpenChange={setCertificationsModalOpen}
        certification={editingCertification}
        onSave={handleSaveCertification}
      />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        open={profileEditModalOpen}
        onOpenChange={setProfileEditModalOpen}
        profile={profile}
        onSave={handleSaveProfile}
      />

      <div className="h-8" />
    </div>
  );
}