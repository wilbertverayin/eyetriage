'use server';

interface FeedbackInput {
  suggestion: string;
  email?: string;
}

export async function sendFeedback({ suggestion, email }: FeedbackInput): Promise<{ ok: true } | { error: string }> {
  const text = suggestion.trim().slice(0, 2000);
  if (!text) return { error: 'Please write a suggestion first.' };

  const url = process.env.FEEDBACK_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_FEEDBACK_APPS_SCRIPT_URL;
  if (!url) {
    console.error('FEEDBACK_APPS_SCRIPT_URL is not set; feedback was not delivered.');
    return { error: 'Feedback is not set up yet. Please try again later.' };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        suggestion: text,
        email: (email ?? '').trim().slice(0, 200),
        source: 'eyetriage',
        submittedAt: new Date().toISOString(),
      }),
      redirect: 'follow',
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true };
  } catch (error) {
    console.error('Failed to deliver feedback:', error);
    return { error: 'Could not send your feedback. Please try again later.' };
  }
}
