// AI features disabled for static build

import { AnalyzeEyeImageInput, AnalyzeEyeImageOutput } from "@/ai/flows/analyze-eye-image";
import { SummarizeOphthalmologistReviewsInput, SummarizeOphthalmologistReviewsOutput } from "@/ai/flows/summarize-ophthalmologist-reviews";
import type { Ophthalmologist } from "@/lib/constants";

const MOCK_ANALYZE_EYE_IMAGE_OUTPUT: AnalyzeEyeImageOutput = {
  triageUrgency: 'Refer Within Week',
  reason: 'MOCK DATA: Patient presents with mild conjunctival injection and reports intermittent blurry vision. Image shows slight corneal clouding. These findings suggest a condition that warrants specialist attention within a week for further evaluation and to rule out infectious keratitis or early uveitis. This is mock data for development purposes.',
  possibleDiagnoses: ['Mock Mild Keratitis', 'Mock Episcleritis', 'Mock Early Uveitis'],
  treatmentSuggestions: ['Advise symptomatic relief with cool compresses (Mock)', 'Recommend avoiding contact lens wear (Mock)', 'Suggest over-the-counter lubricating eye drops (Mock)'],
  referralTimingDetails: 'Refer to an ophthalmologist within 3-5 days for comprehensive slit-lamp examination and appropriate management. (Mock Data)',
};

export async function performEyeAnalysis(_input: AnalyzeEyeImageInput): Promise<AnalyzeEyeImageOutput | { error: string }> {
  return MOCK_ANALYZE_EYE_IMAGE_OUTPUT;
}

export async function summarizeReviews(_input: SummarizeOphthalmologistReviewsInput): Promise<SummarizeOphthalmologistReviewsOutput | { error: string }> {
  return { summary: 'AI features are not available in the static demo.' };
}

export async function fetchNearbyOphthalmologists(_params: { latitude: number; longitude: number }): Promise<Ophthalmologist[] | { error: string }> {
  return { error: 'Location features are not available in the static demo.' };
}
