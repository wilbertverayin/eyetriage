
"use client";

import React, { useState, useMemo } from 'react';
import { MOCK_OPHTHALMOLOGISTS, type Ophthalmologist } from '@/lib/constants';
import ReferralCard from './ReferralCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Search, Users, FileSignature } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import type { AnalyzeEyeImageOutput } from '@/ai/flows/analyze-eye-image';
import { Separator } from '@/components/ui/separator';

interface ReferralSectionProps {
  showSection: boolean;
  triageResult: AnalyzeEyeImageOutput | { error: string } | null; // Still needed for conditional rendering logic in parent
}

export default function ReferralSection({ showSection, triageResult }: ReferralSectionProps) {
  const { toast } = useToast();
  const [doctorNameSearch, setDoctorNameSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [clinicSearch, setClinicSearch] = useState('');

  if (!showSection) {
    return null;
  }

  const handleGeneratePdf = () => {
    toast({
      title: "PDF Generation (Mock)",
      description: "This would generate a printable PDF referral document based on triage and selected doctor.",
    });
  };

  const filteredDoctors = useMemo(() => {
    return MOCK_OPHTHALMOLOGISTS.filter(doctor => {
      const nameMatch = doctorNameSearch ? doctor.name.toLowerCase().includes(doctorNameSearch.toLowerCase()) : true;
      const locationMatch = locationSearch ? doctor.address.toLowerCase().includes(locationSearch.toLowerCase()) : true;
      
      const clinicNameMatch = clinicSearch ? doctor.clinicName.toLowerCase().includes(clinicSearch.toLowerCase()) : true;

      return nameMatch && locationMatch && clinicNameMatch;
    });
  }, [doctorNameSearch, locationSearch, clinicSearch]);

  const handleClearFilters = () => {
    setDoctorNameSearch('');
    setLocationSearch('');
    setClinicSearch('');
  };

  const searchCategories = [
    {
      title: "Find an Eye Doctor",
      placeholder: "Type first name or last name",
      value: doctorNameSearch,
      setter: setDoctorNameSearch,
      iconSrc: "https://placehold.co/56x56.png",
      iconAlt: "Doctor Icon",
      aiHint: "doctor character"
    },
    {
      title: "Search By Location",
      placeholder: "Type city or province",
      value: locationSearch,
      setter: setLocationSearch,
      iconSrc: "https://placehold.co/56x56.png",
      iconAlt: "Location Pin Icon",
      aiHint: "map location pin"
    },
    {
      title: "Find a Clinic",
      placeholder: "Type clinic name",
      value: clinicSearch,
      setter: setClinicSearch,
      iconSrc: "https://placehold.co/56x56.png",
      iconAlt: "Clinic Icon",
      aiHint: "clinic building"
    }
  ];

  return (
    <Card className="w-full shadow-lg mt-8">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle className="font-headline text-2xl">Referral Options</CardTitle>
            <CardDescription>Based on the AI triage, find suitable ophthalmologists or generate a general referral.</CardDescription>
          </div>
          {/* This button is a general action for this section, can be moved or duplicated if needed */}
          <Button variant="outline" onClick={handleGeneratePdf}>
            <FileText className="mr-2 h-4 w-4" />
            Generate PDF Referral (Mock)
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Triage Result display removed from here as it's shown by TriageDisplay component on DashboardPage */}

        <div>
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 mr-3 text-primary" />
            <h2 className="font-headline text-xl text-foreground">Suggested Referrals</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {searchCategories.map((category) => (
              <div key={category.title} className="flex flex-col items-center p-4 bg-muted/30 rounded-lg shadow-sm border border-border">
                <Image src={category.iconSrc} alt={category.iconAlt} width={56} height={56} className="mb-3 rounded-md" data-ai-hint={category.aiHint} />
                <h3 className="text-lg font-semibold text-foreground/90 mb-3 text-center">{category.title}</h3>
                <div className="relative w-full">
                  <Input
                    type="text"
                    placeholder={category.placeholder}
                    value={category.value}
                    onChange={(e) => category.setter(e.target.value)}
                    className="pl-3 pr-10 py-2 text-sm"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mb-6">
            <Button variant="link" className="text-primary hover:underline text-md" onClick={handleClearFilters}>
              Show All Eye Doctors
            </Button>
          </div>

          {filteredDoctors.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map(doctor => (
                <ReferralCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No ophthalmologists found matching your criteria in the mock directory.</p>
          )}
        </div>
        
        <Separator className="my-8" />

        <div>
          <div className="flex items-center mb-4">
            <FileSignature className="h-6 w-6 mr-3 text-primary" />
            <h2 className="font-headline text-xl text-foreground">Refer to an Ophthalmologist (General)</h2>
          </div>
          <p className="text-muted-foreground">
            If a specific doctor is not chosen or if a general referral is preferred, you can generate a referral letter.
            This letter will include the patient's information, symptoms, AI triage findings, and a recommendation for consultation with an ophthalmologist.
          </p>
          <p className="mt-2 text-sm text-accent font-medium">
            "May give this for now" - Placeholder for further details or actions related to general referral.
          </p>
          <Button className="mt-4" onClick={handleGeneratePdf}>
             Generate General Referral PDF (Mock)
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
