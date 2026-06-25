// AI features disabled for static build

/**
 * @fileOverview Summarizes online reviews for ophthalmologists.
 *
 * - summarizeOphthalmologistReviews - A function to summarize reviews.
 * - SummarizeOphthalmologistReviewsInput - The input type for the summarizeOphthalmologistReviews function.
 * - SummarizeOphthalmologistReviewsOutput - The return type for the summarizeOphthalmologistReviews function.
 */

export interface SummarizeOphthalmologistReviewsInput {
  name: string;
  googleReviews: string;
  socialMediaPosts: string;
}

export interface SummarizeOphthalmologistReviewsOutput {
  summary: string;
}

export async function summarizeOphthalmologistReviews(_input: SummarizeOphthalmologistReviewsInput): Promise<SummarizeOphthalmologistReviewsOutput> {
  return {
    summary: 'AI features are not available in the static demo.',
  };
}
