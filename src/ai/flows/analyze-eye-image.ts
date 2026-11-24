
'use server';

/**
 * @fileOverview Analyzes an eye image and suggests a triage urgency level,
 * possible diagnoses, treatment suggestions, and detailed referral timing
 * based on comprehensive patient history and clinical findings.
 *
 * - analyzeEyeImage - A function that handles the eye image analysis and triage process.
 * - AnalyzeEyeImageInput - The input type for the analyzeEyeImage function.
 * - AnalyzeEyeImageOutput - The return type for the analyzeEyeImage function.
 */

import {z} from 'zod';
import {generateJson, imagePartFromDataUri} from '@/ai/gemini';

const AnalyzeEyeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the anterior eye, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  
  // Patient Demographics
  patientLocation: z.string().optional().describe("Patient's general location (e.g., city, province)."),
  sex: z.enum(['Male', 'Female']).optional().describe("Patient's sex."),

  // Core Complaint & History
  chiefComplaint: z.string().optional().describe('The primary reason for the consultation.'),
  historyOfPresentIllness: z.string().optional().describe('Detailed account of the current symptoms and their progression.'),
  
  // Ocular History
  ocularHistoryGeneral: z.string().optional().describe('General relevant ocular history (e.g., known conditions like glaucoma, AMD).'),
  priorOcularSurgery: z.boolean().optional().describe('Whether the patient has had prior ocular surgery (e.g., cataract, LASIK).'),
  wearsSpectacles: z.boolean().optional().describe('Whether the patient wears spectacles or contact lenses.'),
  eyeMedicationUsed: z.boolean().optional().describe('Whether the patient is currently using any eye medication (e.g., drops).'),
  ocularTrauma: z.boolean().optional().describe('Whether the patient has had ocular trauma.'),
  
  // Medical History
  pastMedicalHistory: z.string().optional().describe('Patient\'s overall past medical conditions and treatments (e.g., diabetes, hypertension).'),
  familyMedicalHistory: z.string().optional().describe('Relevant medical conditions in the patient\'s family (especially eye conditions).'),
  personalAndSocialHistory: z.string().optional().describe('Patient\'s lifestyle, habits (smoking, alcohol), occupation, and social environment.'),
  reviewOfSystems: z.string().optional().describe('A brief review of other body systems for relevant symptoms (e.g., fever, joint pain).'),

  // Physical Examination Findings
  // Right Eye (OD)
  visualAcuityOD_SC: z.string().optional().describe("Visual acuity (SC - without spectacles) for the Right Eye (e.g., 20/20, CF 2ft)."),
  visualAcuityOD_CC: z.string().optional().describe("Visual acuity (CC - with spectacles) for the Right Eye (e.g., 20/20, PHNI)."),
  colorTestingOD: z.string().optional().describe("Color vision testing results for the Right Eye (e.g., 14/14 Ishihara, mild red desaturation)."),
  amslerGridOD: z.string().optional().describe("AMSLER grid test results for the Right Eye (e.g., Normal, central metamorphopsia)."),
  pupilSizeOD: z.string().optional().describe("Pupil size for the Right Eye in mm (e.g., 3mm)."),
  pupilReactivityOD: z.string().optional().describe("Pupil reactivity to light for the Right Eye (e.g., Brisk, Sluggish, Non-reactive)."),
  pupilRapdOD: z.string().optional().describe("Presence or absence of Relative Afferent Pupillary Defect (RAPD) for the Right Eye (e.g., Present, Absent, Not Tested)."),
  palpationOD: z.string().optional().describe("Findings from eye palpation for the Right Eye (e.g., Soft, Non-tender, Firm)."),
  extraocularMusclesOD: z.string().optional().describe("Extraocular muscle movement findings for the Right Eye (e.g., Full, No EOM restrictions; or specific limitations like -2 limitation in adduction)."),
  grossExaminationOD: z.string().optional().describe("Gross examination findings for the Right Eye (e.g., Lids, Conjunctiva, Cornea)."),

  // Left Eye (OS)
  visualAcuityOS_SC: z.string().optional().describe("Visual acuity (SC - without spectacles) for the Left Eye (e.g., 20/20, CF 2ft)."),
  visualAcuityOS_CC: z.string().optional().describe("Visual acuity (CC - with spectacles) for the Left Eye (e.g., 20/20, PHNI)."),
  colorTestingOS: z.string().optional().describe("Color vision testing results for the Left Eye (e.g., 14/14 Ishihara, mild red desaturation)."),
  amslerGridOS: z.string().optional().describe("AMSLER grid test results for the Left Eye (e.g., Normal, central metamorphopsia)."),
  pupilSizeOS: z.string().optional().describe("Pupil size for the Left Eye in mm (e.g., 3mm)."),
  pupilReactivityOS: z.string().optional().describe("Pupil reactivity to light for the Left Eye (e.g., Brisk, Sluggish, Non-reactive)."),
  pupilRapdOS: z.string().optional().describe("Presence or absence of Relative Afferent Pupillary Defect (RAPD) for the Left Eye (e.g., Present, Absent, Not Tested)."),
  palpationOS: z.string().optional().describe("Findings from eye palpation for the Left Eye (e.g., Soft, Non-tender, Firm)."),
  extraocularMusclesOS: z.string().optional().describe("Extraocular muscle movement findings for the Left Eye (e.g., Full, No EOM restrictions; or specific limitations)."),
  grossExaminationOS: z.string().optional().describe("Gross examination findings for the Left Eye (e.g., Lids, Conjunctiva, Cornea)."),
});

export type AnalyzeEyeImageInput = z.infer<typeof AnalyzeEyeImageInputSchema>;

const AnalyzeEyeImageOutputSchema = z.object({
  triageUrgency:
    z.enum(['Urgent', 'Refer Within Week', 'Manage Locally'])
      .describe('The suggested triage urgency level based on the image analysis.'),
  reason: z.string().describe('The overall reasoning behind the triage urgency level and key findings.'),
  possibleDiagnoses: z.array(z.string()).describe("A list of potential differential diagnoses based on the provided information. Provide at least 2-3 possibilities if applicable."),
  treatmentSuggestions: z.array(z.string()).describe("General suggestions for initial management or treatment approaches if 'Manage Locally' is chosen, or supportive care pending referral. Provide 2-3 suggestions."),
  referralTimingDetails: z.string().describe("Specific guidance on the urgency and timeframe for referral (e.g., 'Immediate referral to ER', 'Refer to ophthalmologist within 24-48 hours', 'Routine ophthalmology follow-up in 1-2 weeks'), complementing the overall triage category.")
});

export type AnalyzeEyeImageOutput = z.infer<typeof AnalyzeEyeImageOutputSchema>;

// JSON schema sent to Gemini; mirrors AnalyzeEyeImageOutputSchema.
const OUTPUT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    triageUrgency: {type: 'string', enum: ['Urgent', 'Refer Within Week', 'Manage Locally']},
    reason: {type: 'string'},
    possibleDiagnoses: {type: 'array', items: {type: 'string'}},
    treatmentSuggestions: {type: 'array', items: {type: 'string'}},
    referralTimingDetails: {type: 'string'},
  },
  required: ['triageUrgency', 'reason', 'possibleDiagnoses', 'treatmentSuggestions', 'referralTimingDetails'],
};

const yesNo = (v?: boolean) => (v === undefined ? undefined : v ? 'Yes' : 'No');

// Builds "Label: value" lines, skipping fields that were not provided.
function lines(pairs: [string, string | undefined][], indent = ''): string {
  return pairs
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([label, v]) => `${indent}${label}: ${v}`)
    .join('\n');
}

function eyeExam(input: AnalyzeEyeImageInput, eye: 'OD' | 'OS'): string {
  const f = (key: string) => (input as Record<string, unknown>)[`${key}${eye}`] as string | undefined;
  return lines([
    ['Visual Acuity (SC)', (input as Record<string, unknown>)[`visualAcuity${eye}_SC`] as string | undefined],
    ['Visual Acuity (CC)', (input as Record<string, unknown>)[`visualAcuity${eye}_CC`] as string | undefined],
    ['Color Testing', f('colorTesting')],
    ['AMSLER Grid', f('amslerGrid')],
    ['Pupil Size', f('pupilSize')],
    ['Pupil Reactivity', f('pupilReactivity')],
    ['RAPD', f('pupilRapd')],
    ['Palpation', f('palpation')],
    ['Extraocular Muscles', f('extraocularMuscles')],
    ['Gross Examination', f('grossExamination')],
  ], '  ') || '  Not provided';
}

function buildPrompt(input: AnalyzeEyeImageInput): string {
  return `You are an expert ophthalmologist specializing in triaging eye conditions based on anterior eye images and comprehensive clinical data.

You will use the attached image and the following patient information to:
1. Determine the appropriate triage urgency level: Urgent, Refer Within Week, or Manage Locally.
2. List 2-3 possible differential diagnoses.
3. Suggest 2-3 general treatment or management approaches.
4. Provide specific details on the timing for referral.
5. Explain the overall reasoning for your decisions, highlighting key findings from all provided data.

If the image is not a photo of a human eye or is too poor to assess, say so in the reasoning and base the triage only on the clinical data.

Patient Information:
${lines([
  ['Location', input.patientLocation],
  ['Sex', input.sex],
  ['Chief Complaint', input.chiefComplaint],
  ['History of Present Illness', input.historyOfPresentIllness],
]) || 'Not provided'}

Ocular History:
${lines([
  ['General', input.ocularHistoryGeneral],
  ['Prior Ocular Surgery', yesNo(input.priorOcularSurgery)],
  ['Wears Spectacles/Contacts', yesNo(input.wearsSpectacles)],
  ['Current Eye Medication', yesNo(input.eyeMedicationUsed)],
  ['Ocular Trauma', yesNo(input.ocularTrauma)],
], '  ') || '  Not provided'}

${lines([
  ['Past Medical History', input.pastMedicalHistory],
  ['Family Medical History', input.familyMedicalHistory],
  ['Personal and Social History', input.personalAndSocialHistory],
  ['Review of Systems', input.reviewOfSystems],
])}

Physical Examination Findings:
Right Eye (OD):
${eyeExam(input, 'OD')}
Left Eye (OS):
${eyeExam(input, 'OS')}

Based on all available information (image, history, and physical exam), provide a comprehensive analysis as JSON matching the response schema.
Ensure each list (diagnoses, treatments) has at least 2-3 distinct items if clinically appropriate.
History items that are absent were not provided; do not assume they are "No".`;
}

export async function analyzeEyeImage(input: AnalyzeEyeImageInput): Promise<AnalyzeEyeImageOutput> {
  const parsedInput = AnalyzeEyeImageInputSchema.parse(input);
  const raw = await generateJson<unknown>(
    [imagePartFromDataUri(parsedInput.photoDataUri), {type: 'text', text: buildPrompt(parsedInput)}],
    OUTPUT_JSON_SCHEMA
  );
  const result = AnalyzeEyeImageOutputSchema.safeParse(raw);
  if (!result.success) {
    console.error('Gemini triage output failed validation:', result.error.issues);
    throw new Error('AI model did not return the expected output structure.');
  }
  return result.data;
}
