import type { NurseFullProfile, Job, JobMatch } from "@/types";

const WEIGHTS = {
  experience: 30,
  certifications: 40,
  skills: 30,
};

// Keywords that indicate a nursing/healthcare professional
const NURSING_KEYWORDS = [
  "rn", "lpn", "cna", "np", "aprn", "bsn", "msn", "dnp",
  "registered nurse", "licensed practical", "nurse", "nursing",
  "patient care", "clinical", "medical", "healthcare", "hospital",
  "phlebotomy", "icu", "ER", "OR", "pediatric", "neonatal",
  "surgical", "critical care", "telemetry", "med-surg",
];

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

  // Check if this profile looks like a nursing/healthcare professional
  const profileTokens = [...nurseCerts, ...nurseSkills];
  const hasNursingProfile = profileTokens.some((token) =>
    NURSING_KEYWORDS.some((kw) => token.includes(kw))
  );

  for (const job of jobs) {
    let score = 0;
    let maxScore = 0;
    const matchedCertifications: string[] = [];
    const matchedSkills: string[] = [];
    let experienceMatch = false;

    // Experience matching — always evaluated
    maxScore += WEIGHTS.experience;
    if (job.min_experience_years === 0 || nurseYears >= job.min_experience_years) {
      experienceMatch = true;
      score += WEIGHTS.experience;
    } else if (nurseYears > 0) {
      // Partial credit only up to 50% so unrelated experience doesn't inflate score
      const ratio = nurseYears / job.min_experience_years;
      score += Math.round(WEIGHTS.experience * Math.min(ratio, 1) * 0.5);
    }

    // Certification matching — only evaluated if job requires certs
    const requiredCerts = job.required_certifications.map((c) =>
      c.toLowerCase().trim()
    );
    if (requiredCerts.length > 0) {
      maxScore += WEIGHTS.certifications;
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
      score += Math.round(WEIGHTS.certifications * (certMatches / requiredCerts.length));
    }

    // Skills matching — only evaluated if job requires skills
    const requiredSkills = job.required_skills.map((s) =>
      s.toLowerCase().trim()
    );
    if (requiredSkills.length > 0) {
      maxScore += WEIGHTS.skills;
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
      score += Math.round(WEIGHTS.skills * (skillMatches / requiredSkills.length));
    }

    // Normalize score to 0-100 based on categories actually evaluated
    let normalizedScore = maxScore > 0
      ? Math.round((score / maxScore) * 100)
      : 0;

    // If no nursing indicators in profile and job requires specific certs
    // that weren't matched, this person is almost certainly unqualified
    if (!hasNursingProfile && requiredCerts.length > 0 && matchedCertifications.length === 0) {
      normalizedScore = Math.min(normalizedScore, 5);
    }

    matches.push({
      job,
      match_score: normalizedScore,
      matched_certifications: matchedCertifications,
      matched_skills: matchedSkills,
      experience_match: experienceMatch,
    });
  }

  // Sort by score descending
  matches.sort((a, b) => b.match_score - a.match_score);

  return matches;
}
