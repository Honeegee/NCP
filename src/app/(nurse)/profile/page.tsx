"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Upload,
  Save,
  FileText,
  User,
  Briefcase,
  Award,
  GraduationCap,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Sparkles,
  FileCheck,
  Edit2,
  Building2,
  Plus,
  Trash2,
  Activity,
  MoreVertical,
} from "lucide-react";
import type { NurseFullProfile, NurseExperience, NurseEducation, NurseSkill, NurseCertification } from "@/types";
import ExperienceModal from "@/components/profile/modals/ExperienceModal";
import EducationModal from "@/components/profile/modals/EducationModal";
import SkillsModal from "@/components/profile/modals/SkillsModal";
import CertificationsModal from "@/components/profile/modals/CertificationsModal";
import { profileUpdateSchema } from "@/lib/validators";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<NurseFullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [editMode, setEditMode] = useState(false);

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

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    graduation_year: "",
    bio: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/nurses/me");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          graduation_year: data.graduation_year?.toString() || "",
          bio: data.bio || "",
        });
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

  const handleSave = async () => {
    if (!profile) return;

    const validation = profileUpdateSchema.safeParse({
      ...formData,
      graduation_year: formData.graduation_year
        ? parseInt(formData.graduation_year)
        : null,
    });

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as string] = issue.message;
        }
      });
      setFormErrors(newErrors);
      toast.error("Please fix the errors before saving");
      return;
    }

    setFormErrors({});
    setSaving(true);

    try {
      const res = await fetch(`/api/nurses/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          graduation_year: formData.graduation_year
            ? parseInt(formData.graduation_year)
            : null,
        }),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        setEditMode(false);
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

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
          graduation_year: data.graduation_year ? parseInt(data.graduation_year) : null,
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
        <div className="flex items-center gap-6 mb-8">
          {/* Avatar on the left */}
          <div className="relative group flex-shrink-0">
            {profile.profile_picture_url ? (
              <div className="profile-picture relative" style={{ height: '12rem', width: '12rem' }}>
                <Image
                  src={profile.profile_picture_url}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  fill
                  sizes="192px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="profile-picture flex items-center justify-center text-5xl font-bold text-sky-600" style={{ height: '12rem', width: '12rem' }}>
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

          {/* Profile Info on the right - aligned with avatar */}
          <div className="flex-1 flex items-center">
            <div className="w-full">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {(profile.city || profile.country) && (
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-sky-600" />
                        <span>{profile.city}{profile.city && profile.country ? ', ' : ''}{profile.country}</span>
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
                {editMode ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setEditMode(true)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {editMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">First Name</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Last Name</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Professional Summary</Label>
                    <Textarea
                      placeholder="Share your nursing experience, specialties, and professional goals..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (formErrors.phone) {
                          setFormErrors({ ...formErrors, phone: "" });
                        }
                      }}
                      placeholder="+1 (555) 000-0000"
                      className={formErrors.phone ? "border-red-500" : ""}
                    />
                    {formErrors.phone && (
                      <p className="text-sm text-red-500">{formErrors.phone}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">City</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Country</Label>
                      <Input
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {profile.bio ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                      {profile.bio}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No professional summary added yet. Click edit to add one.
                    </p>
                  )}
                </div>
              )}
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <div className="section-icon">
                  <Briefcase />
                </div>
                Experience
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => handleOpenExperienceModal()}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {profile.experience && profile.experience.length > 0 ? (
                <div className="space-y-4">
                  {profile.experience.map((exp, index) => (
                    <div key={exp.id} className={index !== 0 ? "pt-4 border-t" : ""}>
                      <div className="experience-item">
                        <div className="experience-icon">
                          <Building2 />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                                {exp.department && (
                                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                    {exp.department}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-sky-600">{exp.employer}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenExperienceModal(exp)}>
                                  <Edit2 className="h-3.5 w-3.5 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteExperience(exp.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : "Present"}
                            </span>
                          </div>
                          {exp.description && (
                            <ul className="mt-3 space-y-1.5 text-sm">
                              {exp.description.split("\n").map((line, li) => (
                                <li key={li} className="flex items-start gap-2">
                                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                                  <span>{line}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No experience added</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload your resume to auto-populate</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education Section */}
          <Card className="section-card mt-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <div className="section-icon section-icon-purple">
                  <GraduationCap />
                </div>
                Education
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => handleOpenEducationModal()}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {profile.education && profile.education.length > 0 ? (
                <div className="space-y-6">
                  {profile.education.map((edu, index) => (
                    <div key={edu.id} className={index !== 0 ? "pt-6 border-t" : ""}>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{edu.institution}</h3>
                              <p className="text-sm text-muted-foreground">{edu.degree}</p>
                              {edu.graduation_year && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Graduated {edu.graduation_year}
                                </p>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenEducationModal(edu)}>
                                  <Edit2 className="h-3.5 w-3.5 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteEducation(edu.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Delete
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
                <div className="text-center py-12">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <GraduationCap className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No education added</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload your resume to auto-populate</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card className="section-card mt-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <div className="section-icon section-icon-purple">
                  <Sparkles />
                </div>
                Skills
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => handleOpenSkillsModal()}>
                <Plus className="h-4 w-4" />
              </Button>
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
                        <svg className="h-3 w-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No skills added</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload your resume to auto-populate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Profile Strength */}
          <Card className="section-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-800">
                <div className="section-icon section-icon-green">
                  <Activity />
                </div>
                Profile Strength
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-800">
                <div className="section-icon section-icon-orange">
                  <Award />
                </div>
                Certifications
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => handleOpenCertificationsModal()}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {profile.certifications && profile.certifications.length > 0 ? (
                <div className="space-y-3">
                  {profile.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
                      <div className="h-10 w-10 rounded bg-card border flex items-center justify-center flex-shrink-0">
                        <Award className="h-5 w-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm truncate">
                              {cert.cert_type}
                            </p>
                            {cert.verified && (
                              <div className="flex items-center gap-1 mt-1">
                                <CheckCircle className="h-3 w-3 text-success" />
                                <span className="text-xs text-success">Verified</span>
                              </div>
                            )}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="h-6 w-6 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center">
                                <MoreVertical className="h-3 w-3" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenCertificationsModal(cert)}>
                                  <Edit2 className="h-3 w-3 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteCertification(cert.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Delete
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
                <div className="text-center py-8">
                  <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No certifications yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card className="section-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-800">
                <div className="section-icon">
                  <FileText />
                </div>
                Resume
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
                        className="flex items-center gap-2 p-2 rounded bg-muted text-sm"
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
                        <button
                          onClick={() => handleDeleteResume(resume.id)}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
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

      <div className="h-8" />
    </div>
  );
}