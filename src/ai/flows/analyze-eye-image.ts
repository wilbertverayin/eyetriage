// AI features disabled for static build

/**
 * @fileOverview Analyzes an eye image and suggests a triage urgency level,
 * possible diagnoses, treatment suggestions, and detailed referral timing
 * based on comprehensive patient history and clinical findings.
 *
 * - analyzeEyeImage - A function that handles the eye image analysis and triage process.
 * - AnalyzeEyeImageInput - The input type for the analyzeEyeImage function.
 * - AnalyzeEyeImageOutput - The return type for the analyzeEyeImage function.
 */

export interface AnalyzeEyeImageInput {
  photoDataUri: string;
  // Patient Demographics
  patientLocation?: string;
  sex?: 'Male' | 'Female';
  // Core Complaint & History
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  // Ocular History
  ocularHistoryGeneral?: string;
  priorOcularSurgery?: boolean;
  wearsSpectacles?: boolean;
  eyeMedicationUsed?: boolean;
  ocularTrauma?: boolean;
  // Medical History
  pastMedicalHistory?: string;
  familyMedicalHistory?: string;
  personalAndSocialHistory?: string;
  reviewOfSystems?: string;
  // Physical Examination Findings - Right Eye (OD)
  visualAcuityOD_SC?: string;
  visualAcuityOD_CC?: string;
  colorTestingOD?: string;
  amslerGridOD?: string;
  pupilSizeOD?: string;
  pupilReactivityOD?: string;
  pupilRapdOD?: string;
  palpationOD?: string;
  extraocularMusclesOD?: string;
  grossExaminationOD?: string;
  // Left Eye (OS)
  visualAcuityOS_SC?: string;
  visualAcuityOS_CC?: string;
  colorTestingOS?: string;
  amslerGridOS?: string;
  pupilSizeOS?: string;
  pupilReactivityOS?: string;
  pupilRapdOS?: string;
  palpationOS?: string;
  extraocularMusclesOS?: string;
  grossExaminationOS?: string;
}

export interface AnalyzeEyeImageOutput {
  triageUrgency: 'Urgent' | 'Refer Within Week' | 'Manage Locally';
  reason: string;
  possibleDiagnoses: string[];
  treatmentSuggestions: string[];
  referralTimingDetails: string;
}

export async function analyzeEyeImage(_input: AnalyzeEyeImageInput): Promise<AnalyzeEyeImageOutput> {
  return {
    triageUrgency: 'Manage Locally',
    reason: 'AI features are not available in the static demo.',
    possibleDiagnoses: [],
    treatmentSuggestions: [],
    referralTimingDetails: 'AI features are not available in the static demo.',
  };
}
