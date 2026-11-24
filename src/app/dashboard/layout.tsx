// Gemini can take 30+ seconds per triage; allow the server action enough time.
export const maxDuration = 120;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
