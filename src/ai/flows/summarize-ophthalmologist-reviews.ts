'use server';
/**
 * @fileOverview Summarizes online reviews for ophthalmologists.
 *
 * - summarizeOphthalmologistReviews - A function to summarize reviews.
 * - SummarizeOphthalmologistReviewsInput - The input type for the summarizeOphthalmologistReviews function.
 * - SummarizeOphthalmologistReviewsOutput - The return type for the summarizeOphthalmologistReviews function.
 */

import {z} from 'zod';
import {generateJson} from '@/ai/gemini';

const SummarizeOphthalmologistReviewsInputSchema = z.object({
  name: z.string().describe('The name of the ophthalmologist.'),
  googleReviews: z.string().describe('Google reviews for the ophthalmologist.'),
  socialMediaPosts: z.string().describe('Social media posts about the ophthalmologist.'),
});
export type SummarizeOphthalmologistReviewsInput = z.infer<typeof SummarizeOphthalmologistReviewsInputSchema>;

const SummarizeOphthalmologistReviewsOutputSchema = z.object({
  summary: z.string().describe('A summary of the Google reviews and social media posts.'),
});
export type SummarizeOphthalmologistReviewsOutput = z.infer<typeof SummarizeOphthalmologistReviewsOutputSchema>;

export async function summarizeOphthalmologistReviews(input: SummarizeOphthalmologistReviewsInput): Promise<SummarizeOphthalmologistReviewsOutput> {
  const {name, googleReviews, socialMediaPosts} = SummarizeOphthalmologistReviewsInputSchema.parse(input);
  const raw = await generateJson<unknown>(
    [{
      type: 'text',
      text: `You are a helpful assistant that summarizes reviews for ophthalmologists.

Summarize the following Google reviews and social media posts about the ophthalmologist. Focus on the overall sentiment and key themes.

Ophthalmologist Name: ${name}
Google Reviews: ${googleReviews}
Social Media Posts: ${socialMediaPosts}`,
    }],
    {type: 'object', properties: {summary: {type: 'string'}}, required: ['summary']}
  );
  return SummarizeOphthalmologistReviewsOutputSchema.parse(raw);
}
