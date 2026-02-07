import type { NurseFullProfile, Job, JobMatch } from "@/types";

const WEIGHTS = {
  experience: 30,
  certifications: 40,
  skills: 30,
};

export function matchJobs(
  nurse: NurseFullProfile,
  jobs: Job[]
): JobMatch[] {
  const matches: JobMatch[] = [];

  const nurseCerts = nurse.certifications.map((c) =>
    c.cert_type.toLowerCase().trim()
  );
  const nurseSkills = nurse.skills.map((s) =>
    s.skill_name.toLowerCase().trim()
  );
  const nurseYears = nurse.years_of_experience || 0;

  for (const job of jobs) {
    let score = 0;
    const matchedCertifications: string[] = [];
    const matchedSkills: string[] = [];
    let experienceMatch = false;

    // Experience matching (30 points)
    if (nurseYears >= job.min_experience_years) {
      experienceMatch = true;
      score += WEIGHTS.experience;
    } else if (nurseYears > 0 && job.min_experience_years > 0) {
      // Partial credit based on how close
      const ratio = nurseYears / job.min_experience_years;
      score += Math.round(WEIGHTS.experience * Math.min(ratio, 1));
    }

    // Certification matching (40 points)
    const requiredCerts = job.required_certifications.map((c) =>
      c.toLowerCase().trim()
    );
    if (requiredCerts.length > 0) {
      let certMatches = 0;
      for (const reqCert of requiredCerts) {
        if (
          nurseCerts.some(
            (nc) => nc.includes(reqCert) || reqCert.includes(nc)
          )
        ) {
          certMatches++;
          matchedCertifications.push(reqCert);
        }
      }
      const certRatio = certMatches / requiredCerts.length;
      score += Math.round(WEIGHTS.certifications * certRatio);
    } else {
      // No certs required — full score
      score += WEIGHTS.certifications;
    }

    // Skills matching (30 points)
    const requiredSkills = job.required_skills.map((s) =>
      s.toLowerCase().trim()
    );
    if (requiredSkills.length > 0) {
      let skillMatches = 0;
      for (const reqSkill of requiredSkills) {
        if (
          nurseSkills.some(
            (ns) => ns.includes(reqSkill) || reqSkill.includes(ns)
          )
        ) {
          skillMatches++;
          matchedSkills.push(reqSkill);
        }
      }
      const skillRatio = skillMatches / requiredSkills.length;
      score += Math.round(WEIGHTS.skills * skillRatio);
    } else {
      score += WEIGHTS.skills;
    }

    matches.push({
      job,
      match_score: score,
      matched_certifications: matchedCertifications,
      matched_skills: matchedSkills,
      experience_match: experienceMatch,
    });
  }

  // Sort by score descending
  matches.sort((a, b) => b.match_score - a.match_score);

  return matches;
}
