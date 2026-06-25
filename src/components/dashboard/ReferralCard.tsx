
"use client";

import type { Ophthalmologist } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Star, MessageSquare, ExternalLink, Loader2, Building, AlertTriangle } from 'lucide-react';
import { summarizeReviews } from '@/app/dashboard/actions';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReferralCardProps {
  doctor: Ophthalmologist;
}

export default function ReferralCard({ doctor }: ReferralCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const { toast } = useToast();

  const canSummarizeReviews = !!doctor.googleReviews && doctor.googleReviews.trim() !== "";

  const handleSummarizeReviews = async () => {
    if (!canSummarizeReviews) {
        toast({
            title: "No Reviews Available",
            description: "Detailed reviews are not available for this listing to summarize.",
            variant: "default"
        });
        return;
    }
    setIsLoadingSummary(true);
    setSummary(null);
    const result = await summarizeReviews({
      name: doctor.name,
      googleReviews: doctor.googleReviews || "", // Ensure it's not undefined for the action
      socialMediaPosts: doctor.socialMediaPosts || "", // Ensure it's not undefined
    });
    setIsLoadingSummary(false);
    if ('error' in result && result.error) {
      toast({
        title: "Error Summarizing Reviews",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.summary) {
      setSummary(result.summary);
      toast({
        title: "Review Summary Generated",
        description: `AI summary for ${doctor.name} is ready.`,
      });
    }
  };
  
  const fallbackIconText = doctor.name ? doctor.name.substring(0, 1).toUpperCase() : "N/A";
  const photoUrl = doctor.photoUrl || `https://placehold.co/100x100.png?text=${fallbackIconText}`;


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage 
              src={photoUrl} 
              alt={doctor.name} 
              data-ai-hint="doctor portrait clinic"
              onError={(e) => {
                // Fallback if primary photoUrl fails (e.g. Google Maps icon link)
                const target = e.target as HTMLImageElement;
                target.onerror = null; // prevent infinite loop
                target.src = `https://placehold.co/100x100.png?text=${fallbackIconText}`;
              }}
            />
            <AvatarFallback>{fallbackIconText}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-xl">{doctor.name}</CardTitle>
            <CardDescription className="text-primary">{doctor.specialty || "Ophthalmologist"}</CardDescription>
            {doctor.googleRating && (
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-500" />
                {doctor.googleRating.toFixed(1)} Google Rating
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 flex-grow">
        <div className="flex items-start text-sm text-muted-foreground">
          <Building className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
          <span>{doctor.clinicName || "Clinic name not available"}</span>
        </div>
        <div className="flex items-start text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
          <span>{doctor.address || "Address not available"}</span>
        </div>
        {doctor.phone && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="h-4 w-4 mr-2 shrink-0" />
            <span>{doctor.phone}</span>
          </div>
        )}
        
        {summary && (
          <div className="mt-3 pt-3 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-1">AI Review Summary:</h4>
            <p className="text-xs text-muted-foreground italic whitespace-pre-wrap">{summary}</p>
          </div>
        )}
        {isLoadingSummary && (
          <div className="mt-3 pt-3 border-t border-border text-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground mt-1">Generating summary...</p>
          </div>
        )}
        {!canSummarizeReviews && !summary && !isLoadingSummary && doctor.id !== "mock_1" && doctor.id !== "mock_2" && ( // Only show for non-mock if no reviews
             <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground italic">Detailed patient reviews not available for AI summary for this listing.</p>
            </div>
        )}

      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 items-stretch">
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSummarizeReviews} 
            disabled={isLoadingSummary || !canSummarizeReviews}
            title={!canSummarizeReviews ? "Review data not available for summary" : (summary ? "Refresh AI Review Summary" : "AI Summarize Reviews")}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {summary ? "Refresh Summary" : "AI Summarize Reviews"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details & Refer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline">{doctor.name}</AlertDialogTitle>
              <AlertDialogDescription>
                This is a placeholder for full referral details and actions.
                In a full app, this would show more information, map directions, and allow direct referral.
                {doctor.lat && doctor.lng && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${doctor.lat},${doctor.lng}&query_place_id=${doctor.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline block mt-2"
                  >
                    Open in Google Maps
                  </a>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="text-sm space-y-2">
              <p><strong>Clinic:</strong> {doctor.clinicName || "N/A"}</p>
              <p><strong>Specialty:</strong> {doctor.specialty || "Ophthalmologist"}</p>
              <p><strong>Address:</strong> {doctor.address || "N/A"}</p>
              {doctor.phone && <p><strong>Phone:</strong> {doctor.phone}</p>}
              {doctor.googleRating && <p><strong>Rating:</strong> {doctor.googleRating.toFixed(1)} / 5</p>}
              
              {doctor.googleReviews && (
                <>
                  <p className="mt-2"><strong>Original Google Reviews (if available):</strong></p>
                  <p className="text-xs max-h-20 overflow-y-auto bg-muted p-2 rounded">{doctor.googleReviews}</p>
                </>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction onClick={() => toast({title: "Referral Sent (Mock)", description: `Referral for ${doctor.name} would be processed here.`})}>
                Generate PDF Referral (Mock)
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
