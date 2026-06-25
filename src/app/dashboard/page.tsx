"use client";

import React, { useState } from 'react';
import PatientDataSection from '@/components/dashboard/PatientDataSection';
import TriageDisplay from '@/components/dashboard/TriageDisplay';
import type { AnalyzeEyeImageOutput } from '@/ai/flows/analyze-eye-image';

export default function DashboardPage() {
  const [triageResult, setTriageResult] = useState<AnalyzeEyeImageOutput | { error: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTriageResult = (result: AnalyzeEyeImageOutput | { error: string } | null) => {
    setTriageResult(result);
  };

  return (
    <div className="space-y-6 pt-12 px-12">
        <PatientDataSection
          onTriageResult={handleTriageResult}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
        />
        <TriageDisplay result={triageResult} isProcessing={isProcessing} />
    </div>
  );
}
