import type { AnalyzeEyeImageOutput } from '@/ai/flows/analyze-eye-image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CalendarClock, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TriageDisplayProps {
  result: AnalyzeEyeImageOutput | { error: string } | null;
  isProcessing: boolean;
}

const TriageIconAndColor = ({ urgency }: { urgency: AnalyzeEyeImageOutput['triageUrgency'] | undefined }) => {
  switch (urgency) {
    case 'Urgent':
      return { Icon: AlertTriangle, color: 'text-destructive', bgColor: 'bg-destructive/10', borderColor: 'border-destructive' };
    case 'Refer Within Week':
      return { Icon: CalendarClock, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500' };
    case 'Manage Locally':
      return { Icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500' };
    default:
      return { Icon: Zap, color: 'text-primary', bgColor: 'bg-primary/10', borderColor: 'border-primary' }; // Default or initial state
  }
};

export default function TriageDisplay({ result, isProcessing }: TriageDisplayProps) {
  if (isProcessing) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Triage Result</CardTitle>
          <CardDescription>AI analysis is currently in progress...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
       <Card className="w-full shadow-lg border-dashed border-muted-foreground/50">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-muted-foreground">Triage Result</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
            <Zap className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Submit patient data and an image to see the triage analysis.</p>
        </CardContent>
      </Card>
    );
  }

  if ('error' in result && result.error) {
    return (
      <Card className="w-full shadow-lg border-destructive">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-destructive flex items-center gap-2">
            <AlertCircle /> Triage Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{result.error}</p>
          <p className="mt-2 text-sm text-muted-foreground">Please check your input or try again. If the problem persists, contact support.</p>
        </CardContent>
      </Card>
    );
  }
  
  const { Icon, color, bgColor, borderColor } = TriageIconAndColor({ urgency: result.triageUrgency });

  return (
    <Card className={`w-full shadow-lg border-2 ${borderColor}`}>
      <CardHeader className={`${bgColor}`}>
        <div className="flex items-center gap-3">
          <Icon className={`h-10 w-10 ${color}`} />
          <div>
            <CardTitle className={`font-headline text-2xl ${color}`}>{result.triageUrgency}</CardTitle>
            <CardDescription className={`${color} opacity-80`}>AI-Suggested Triage Urgency</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <h4 className="font-semibold text-foreground mb-2">Reasoning:</h4>
        <p className="text-foreground/80 whitespace-pre-wrap">{result.reason}</p>
      </CardContent>
    </Card>
  );
}
