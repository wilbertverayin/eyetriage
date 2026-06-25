
"use client";

import React, { useState, useRef, useId } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UploadCloud, Image as ImageIcon, AlertCircle, User, Activity, BookOpen, Users2, ShieldQuestion, Eye, HeartPulse, ShieldAlert, History, SigmaSquare, TestTubeDiagonal, MapPin, Settings, Trash2, Star } from 'lucide-react';
import Image from 'next/image';
import { performEyeAnalysis } from '@/app/dashboard/actions';
import type { AnalyzeEyeImageOutput, AnalyzeEyeImageInput } from '@/ai/flows/analyze-eye-image';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const patientFormSchema = z.object({
  // Demographics
  patientLocation: z.string().optional(),
  age: z.coerce.number().min(0, "Age must be a positive number").max(120, "Age seems too high").optional().nullable().default(null),
  sex: z.enum(['Male', 'Female']).optional(),

  // Core Complaint & History
  chiefComplaint: z.string().max(200, "Chief complaint too long (max 200 chars)").optional(),
  historyOfPresentIllness: z.string().optional(),

  // Ocular History
  ocularHistoryGeneral: z.string().optional(),
  priorOcularSurgery: z.enum(["true", "false"]).optional().transform(val => val === "true"),
  wearsSpectacles: z.enum(["true", "false"]).optional().transform(val => val === "true"),
  eyeMedicationUsed: z.enum(["true", "false"]).optional().transform(val => val === "true"),
  ocularTrauma: z.enum(["true", "false"]).optional().transform(val => val === "true"),
  
  // Medical History
  pastMedicalHistory: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  personalAndSocialHistory: z.string().optional(),
  reviewOfSystems: z.string().optional(),

  // Physical Examination Findings
  // Right Eye (OD)
  visualAcuityOD_SC: z.string().optional(),
  visualAcuityOD_CC: z.string().optional(),
  colorTestingOD: z.string().optional(),
  amslerGridOD: z.string().optional(),
  pupilSizeOD: z.string().optional(),
  pupilReactivityOD: z.string().optional(),
  pupilRapdOD: z.string().optional(),
  palpationOD: z.string().optional(),
  extraocularMusclesOD: z.string().optional(),
  grossExaminationOD: z.string().optional(),
  
  // Left Eye (OS)
  visualAcuityOS_SC: z.string().optional(),
  visualAcuityOS_CC: z.string().optional(),
  colorTestingOS: z.string().optional(),
  amslerGridOS: z.string().optional(),
  pupilSizeOS: z.string().optional(),
  pupilReactivityOS: z.string().optional(),
  pupilRapdOS: z.string().optional(),
  palpationOS: z.string().optional(),
  extraocularMusclesOS: z.string().optional(),
  grossExaminationOS: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface PatientDataSectionProps {
  onTriageResult: (result: AnalyzeEyeImageOutput | { error: string } | null) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

interface UploadedImage {
  id: string;
  preview: string;
  dataUri: string;
  file: File;
}

const MAX_IMAGES = 3;

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode; description?: string }> = ({ title, icon, description }) => (
  <div className="mt-8 mb-4">
    <div className="flex items-center gap-3 mb-1">
      {icon}
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
    </div>
    {description && <p className="text-sm text-muted-foreground ml-9">{description}</p>}
    <Separator className="mt-2" />
  </div>
);

export default function PatientDataSection({ onTriageResult, isProcessing, setIsProcessing }: PatientDataSectionProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const generatedId = useId();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: { 
      patientLocation: "",
      age: null,
      sex: undefined, 
      chiefComplaint: "",
      historyOfPresentIllness: "",
      ocularHistoryGeneral: "",
      priorOcularSurgery: undefined,
      wearsSpectacles: undefined,
      eyeMedicationUsed: undefined,
      ocularTrauma: undefined,
      pastMedicalHistory: "",
      familyMedicalHistory: "",
      personalAndSocialHistory: "",
      reviewOfSystems: "",
      visualAcuityOD_SC: "",
      visualAcuityOD_CC: "",
      colorTestingOD: "",
      amslerGridOD: "",
      pupilSizeOD: "",
      pupilReactivityOD: "",
      pupilRapdOD: "",
      palpationOD: "",
      extraocularMusclesOD: "",
      grossExaminationOD: "",
      visualAcuityOS_SC: "",
      visualAcuityOS_CC: "",
      colorTestingOS: "",
      amslerGridOS: "",
      pupilSizeOS: "",
      pupilReactivityOS: "",
      pupilRapdOS: "",
      palpationOS: "",
      extraocularMusclesOS: "",
      grossExaminationOS: "",
    },
  });

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    setImageError(null);

    let currentImageCount = uploadedImages.length;
    const newImages: UploadedImage[] = [];
    const filesToProcess = Array.from(files);

    for (const file of filesToProcess) {
      if (currentImageCount >= MAX_IMAGES) {
        toast({ title: "Image Limit Reached", description: `You can upload a maximum of ${MAX_IMAGES} images.`, variant: "default" });
        break;
      }
      if (!file.type.startsWith('image/')) {
        setImageError(`File "${file.name}" is not a valid image type. Please upload JPEG, PNG, GIF, or WEBP.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
         setImageError(`File "${file.name}" is too large. Maximum size is 5MB.`);
         continue;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: UploadedImage = {
          id: `${file.name}-${file.lastModified}-${Math.random().toString(36).substring(2,9)}`, 
          preview: reader.result as string,
          dataUri: reader.result as string,
          file: file,
        };
        
        setUploadedImages(prev => {
          const updated = [...prev, newImage].slice(0, MAX_IMAGES);
          if (updated.length > 0 && !primaryImageId) {
             setPrimaryImageId(updated[0].id);
          } else if (primaryImageId && !updated.find(img => img.id === primaryImageId) && updated.length > 0) {
             setPrimaryImageId(updated[0].id);
          } else if (updated.length === 0) {
             setPrimaryImageId(null);
          }
          return updated;
        });
      };
      reader.readAsDataURL(file);
      currentImageCount++;
    }
  };

  const handleImageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
    if (event.target) event.target.value = ''; 
  };

  const handleRemoveImage = (idToRemove: string) => {
    setUploadedImages(prevImages => {
      const newImages = prevImages.filter(image => image.id !== idToRemove);
      if (primaryImageId === idToRemove) {
        setPrimaryImageId(newImages.length > 0 ? newImages[0].id : null);
      }
      if (newImages.length < MAX_IMAGES) setImageError(null); 
      return newImages;
    });
  };

  const handleSetPrimaryImage = (idToSet: string) => {
    setPrimaryImageId(idToSet);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => { event.preventDefault(); event.stopPropagation(); setIsDraggingOver(true); };
  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => { event.preventDefault(); event.stopPropagation(); setIsDraggingOver(false); };
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => { event.preventDefault(); event.stopPropagation(); };
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault(); event.stopPropagation(); setIsDraggingOver(false);
    processFiles(event.dataTransfer.files);
     if (fileInputRef.current) { 
        try {
           fileInputRef.current.value = ""; 
        } catch (e) { console.warn("Could not clear file input on drop: ", e); }
    }
  };

  const onSubmit: SubmitHandler<PatientFormValues> = async (data) => {
    if (uploadedImages.length === 0 || !primaryImageId) {
      setImageError("Please upload at least one eye image and select a primary image for analysis.");
      toast({ title: "Image Required", description: "An eye image is required for triage, and one must be set as primary.", variant: "destructive" });
      return;
    }
    
    const primaryImg = uploadedImages.find(img => img.id === primaryImageId);
    if (!primaryImg) {
       setImageError("Primary image not found. Please select one.");
       toast({ title: "Primary Image Missing", description: "Please select a primary image for analysis.", variant: "destructive" });
       return;
    }

    setImageError(null);
    setIsProcessing(true);
    onTriageResult(null); 

    const analysisInput: AnalyzeEyeImageInput = {
      photoDataUri: primaryImg.dataUri,
      patientLocation: data.patientLocation,
      sex: data.sex,
      chiefComplaint: data.chiefComplaint,
      historyOfPresentIllness: data.historyOfPresentIllness,
      ocularHistoryGeneral: data.ocularHistoryGeneral,
      priorOcularSurgery: data.priorOcularSurgery,
      wearsSpectacles: data.wearsSpectacles,
      eyeMedicationUsed: data.eyeMedicationUsed,
      ocularTrauma: data.ocularTrauma,
      pastMedicalHistory: data.pastMedicalHistory,
      familyMedicalHistory: data.familyMedicalHistory,
      personalAndSocialHistory: data.personalAndSocialHistory,
      reviewOfSystems: data.reviewOfSystems,
      visualAcuityOD_SC: data.visualAcuityOD_SC,
      visualAcuityOD_CC: data.visualAcuityOD_CC,
      colorTestingOD: data.colorTestingOD,
      amslerGridOD: data.amslerGridOD,
      pupilSizeOD: data.pupilSizeOD,
      pupilReactivityOD: data.pupilReactivityOD,
      pupilRapdOD: data.pupilRapdOD,
      palpationOD: data.palpationOD,
      extraocularMusclesOD: data.extraocularMusclesOD,
      grossExaminationOD: data.grossExaminationOD,
      visualAcuityOS_SC: data.visualAcuityOS_SC,
      visualAcuityOS_CC: data.visualAcuityOS_CC,
      colorTestingOS: data.colorTestingOS,
      amslerGridOS: data.amslerGridOS,
      pupilSizeOS: data.pupilSizeOS,
      pupilReactivityOS: data.pupilReactivityOS,
      pupilRapdOS: data.pupilRapdOS,
      palpationOS: data.palpationOS,
      extraocularMusclesOS: data.extraocularMusclesOS,
      grossExaminationOS: data.grossExaminationOS,
    };

    const result = await performEyeAnalysis(analysisInput);
    onTriageResult(result);
    setIsProcessing(false);

    if ('error' in result && result.error) {
      toast({ title: "Triage Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "AI Triage Complete", description: "AI analysis has finished successfully." });
    }
  };
  
  const visualAcuityTooltipContent = (
    <div className="w-auto max-w-xs p-1 text-sm">
      <p className="font-bold">Visual Acuity (VA)</p>
      <p className="text-xs text-muted-foreground mb-1">
        Visual acuity is a measure of how clearly a person can see details at a certain distance. It tells us how sharp or clear the vision is. The numerator (top number) is the distance from the chart during the test. The denominator (bottom number) is the distance at which a person with normal vision can see the same line clearly.
      </p>
      <p className="font-medium text-xs">How to test:</p>
      <ul className="list-disc pl-4 text-xs space-y-0.5 mt-1">
        <li>Use a Snellen chart (or equivalent) at a standard distance (e.g., 6 meters / 20 feet).</li>
        <li>Test one eye at a time, covering the other.</li>
        <li>Ask the patient to read the smallest line of letters they can see.</li>
        <li>Record as a fraction (e.g., 20/20, 6/6).</li>
      </ul>
      <p className="mt-1.5 font-medium text-xs">If unable to read largest letter:</p>
       <ul className="list-disc pl-4 text-xs space-y-0.5 mt-1">
        <li>Counting Fingers (CF at X ft/m)</li>
        <li>Hand Motion (HM at X ft/m)</li>
        <li>Light Perception (LP)</li>
        <li>No Light Perception (NLP)</li>
      </ul>
      <p className="mt-1.5 font-medium text-xs">Record SC (sine correction / without spectacles) and CC (cum correction / with spectacles or pinhole).</p>
    </div>
  );

  const rapdTooltipContent = (
    <div className="w-auto max-w-sm p-1 text-sm">
      <p className="font-bold">Relative Afferent Pupillary Defect (RAPD)</p>
      <p className="text-xs text-muted-foreground mb-1">
        An RAPD, also known as a Marcus Gunn pupil, indicates a decreased pupillary response to light in the affected eye. It signals an issue in the afferent pathway (optic nerve or retina) of one eye compared to the other.
      </p>
      <p className="font-medium text-xs">How to test (Swinging Flashlight Test):</p>
      <ul className="list-disc pl-4 text-xs space-y-0.5 mt-1">
        <li>Dim room lighting. Ask patient to fixate on a distant object.</li>
        <li>Shine a bright light onto one pupil for 2-3 seconds, observe constriction.</li>
        <li>Quickly swing light to the other pupil, observe its initial reaction. Repeat.</li>
        <li><strong>No RAPD:</strong> Both pupils constrict equally. Slight, symmetrical redilation may occur when light is swung away before constricting again when light returns.</li>
        <li><strong>RAPD Present:</strong> When light swings from normal to affected eye, affected pupil paradoxically dilates (or constricts less).</li>
      </ul>
    </div>
  );


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Patient Information & Image Upload</CardTitle>
        <CardDescription>Enter patient details, history, physical exam findings, and upload eye images for AI-powered triage. All fields are optional except the image(s).</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <SectionHeader title="Patient Demographics" icon={<User className="h-6 w-6 text-primary" />} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 35" {...field} 
                        onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                        value={field.value === null || field.value === undefined || isNaN(field.value as number) ? '' : String(field.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Sex</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                          {(['Male', 'Female'] as const).map(option => (
                            <FormItem key={option} className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value={option} /></FormControl>
                              <FormLabel className="font-normal">{option}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="patientLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Detailed Address)</FormLabel>
                    <FormControl><Textarea placeholder="e.g., 123 Rizal Street, Brgy. San Roque, Quezon City, Metro Manila, Philippines. Near the old market." {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SectionHeader title="Clinical History" icon={<History className="h-6 w-6 text-primary" />} />
              <FormField
                control={form.control}
                name="chiefComplaint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chief Complaint</FormLabel>
                    <FormControl><Input placeholder="e.g., Sudden blurry vision in right eye" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="historyOfPresentIllness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>History of Present Illness</FormLabel>
                    <FormControl><Textarea placeholder="Detailed description of current symptoms, progression, associated factors..." {...field} rows={4} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SectionHeader title="Ocular History" icon={<Eye className="h-6 w-6 text-primary" />} />
              <FormField
                control={form.control}
                name="ocularHistoryGeneral"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>General Ocular History (Other Conditions, etc.)</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Known glaucoma, wears contact lenses" {...field} rows={2} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                <FormField
                  control={form.control}
                  name="priorOcularSurgery"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Prior Ocular Surgery?</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value === undefined ? undefined : String(field.value)} className="flex space-x-4">
                          <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wearsSpectacles"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Wears Spectacles/Contacts?</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value === undefined ? undefined : String(field.value)} className="flex space-x-4">
                          <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eyeMedicationUsed"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Current Eye Medication?</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value === undefined ? undefined : String(field.value)} className="flex space-x-4">
                          <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ocularTrauma"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>History of Ocular Trauma?</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value === undefined ? undefined : String(field.value)} className="flex space-x-4">
                          <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <SectionHeader title="Medical History" icon={<HeartPulse className="h-6 w-6 text-primary" />} />
              <FormField control={form.control} name="pastMedicalHistory" render={({ field }) => (<FormItem><FormLabel>Past Medical History</FormLabel><FormControl><Textarea placeholder="e.g., Hypertension, Diabetes, Asthma" {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="familyMedicalHistory" render={({ field }) => (<FormItem><FormLabel>Family Medical History</FormLabel><FormControl><Textarea placeholder="e.g., Mother with glaucoma, Father with AMD" {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
              
              <SectionHeader title="Personal & Social History" icon={<Users2 className="h-6 w-6 text-primary" />} />
              <FormField control={form.control} name="personalAndSocialHistory" render={({ field }) => (<FormItem><FormLabel>Personal and Social History</FormLabel><FormControl><Textarea placeholder="e.g., Smoking, alcohol use, occupation, living situation" {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />

              <SectionHeader title="Review of Systems" icon={<ShieldQuestion className="h-6 w-6 text-primary" />} />
              <FormField control={form.control} name="reviewOfSystems" render={({ field }) => (<FormItem><FormLabel>Review of Systems (Briefly, any other relevant symptoms)</FormLabel><FormControl><Textarea placeholder="e.g., Fever, weight loss, joint pain, rashes" {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />

              <SectionHeader title="Physical Examination" icon={<Activity className="h-6 w-6 text-primary" />} description="Record findings for each eye or if not tested"/>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                  <h4 className="text-md font-semibold text-foreground mb-3 border-b pb-2">Right Eye (OD)</h4>
                  
                  <div className="space-y-1">
                     <h5 className="text-sm font-medium text-foreground/90">
                       <Tooltip delayDuration={100}>
                         <TooltipTrigger asChild>
                           <span className="cursor-help underline decoration-dotted decoration-primary/50">Visual Acuity</span>
                         </TooltipTrigger>
                         <TooltipContent side="top" align="start">{visualAcuityTooltipContent}</TooltipContent>
                       </Tooltip>
                     </h5>
                     <FormField control={form.control} name="visualAcuityOD_SC" render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-xs">SC (Without Spectacles)</FormLabel>
                         <FormControl><Input placeholder="e.g., 20/20, CF 2ft" {...field} /></FormControl>
                         <FormMessage />
                       </FormItem>
                     )} />
                     <FormField control={form.control} name="visualAcuityOD_CC" render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-xs">CC (With Spectacles)</FormLabel>
                         <FormControl><Input placeholder="e.g., 20/20, PHNI" {...field} /></FormControl>
                         <FormMessage />
                       </FormItem>
                     )} />
                  </div>

                  <FormField control={form.control} name="colorTestingOD" render={({ field }) => (<FormItem><FormLabel>Color Testing</FormLabel><FormControl><Input placeholder="e.g., 16/16 Ishihara" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="amslerGridOD" render={({ field }) => (<FormItem><FormLabel>AMSLER Grid</FormLabel><FormControl><Input placeholder="e.g., Normal, metamorphopsia" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <h5 className="text-sm font-medium text-foreground/90 pt-2">Pupils (OD)</h5>
                  <FormField control={form.control} name="pupilSizeOD" render={({ field }) => (<FormItem><FormLabel className="text-xs">Size (mm)</FormLabel><FormControl><Input placeholder="e.g., 3mm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pupilReactivityOD" render={({ field }) => (<FormItem><FormLabel className="text-xs">Reactivity</FormLabel><FormControl><Input placeholder="e.g., Brisk, Sluggish" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pupilRapdOD" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <span className="cursor-help underline decoration-dotted decoration-primary/50">RAPD</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="start">{rapdTooltipContent}</TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl><Input placeholder="e.g., Present, Absent" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="palpationOD" render={({ field }) => (<FormItem><FormLabel>Palpation</FormLabel><FormControl><Input placeholder="e.g., Soft, non-tender" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="extraocularMusclesOD" render={({ field }) => (<FormItem><FormLabel>Extraocular Muscles (EOMs)</FormLabel><FormControl><Input placeholder="e.g., Full, no restrictions" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="grossExaminationOD" render={({ field }) => (<FormItem><FormLabel>Gross Examination</FormLabel><FormControl><Textarea placeholder="e.g., Lids normal, Conjunctiva clear, Cornea transparent" {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                </div>

                <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                  <h4 className="text-md font-semibold text-foreground mb-3 border-b pb-2">Left Eye (OS)</h4>
                   <div className="space-y-1">
                     <h5 className="text-sm font-medium text-foreground/90">
                       <Tooltip delayDuration={100}>
                         <TooltipTrigger asChild>
                           <span className="cursor-help underline decoration-dotted decoration-primary/50">Visual Acuity</span>
                         </TooltipTrigger>
                         <TooltipContent side="top" align="start">{visualAcuityTooltipContent}</TooltipContent>
                       </Tooltip>
                     </h5>
                     <FormField control={form.control} name="visualAcuityOS_SC" render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-xs">SC (Without Spectacles)</FormLabel>
                         <FormControl><Input placeholder="e.g., 20/20, HM" {...field} /></FormControl>
                         <FormMessage />
                       </FormItem>
                     )} />
                     <FormField control={form.control} name="visualAcuityOS_CC" render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-xs">CC (With Spectacles)</FormLabel>
                         <FormControl><Input placeholder="e.g., 20/20, PHNI" {...field} /></FormControl>
                         <FormMessage />
                       </FormItem>
                     )} />
                   </div>
                  <FormField control={form.control} name="colorTestingOS" render={({ field }) => (<FormItem><FormLabel>Color Testing</FormLabel><FormControl><Input placeholder="e.g., 16/16 Ishihara" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="amslerGridOS" render={({ field }) => (<FormItem><FormLabel>AMSLER Grid</FormLabel><FormControl><Input placeholder="e.g., Normal" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <h5 className="text-sm font-medium text-foreground/90 pt-2">Pupils (OS)</h5>
                  <FormField control={form.control} name="pupilSizeOS" render={({ field }) => (<FormItem><FormLabel className="text-xs">Size (mm)</FormLabel><FormControl><Input placeholder="e.g., 3mm" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pupilReactivityOS" render={({ field }) => (<FormItem><FormLabel className="text-xs">Reactivity</FormLabel><FormControl><Input placeholder="e.g., Brisk" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pupilRapdOS" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <span className="cursor-help underline decoration-dotted decoration-primary/50">RAPD</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="start">{rapdTooltipContent}</TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl><Input placeholder="e.g., Absent, Present" {...field} /></FormControl><FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="palpationOS" render={({ field }) => (<FormItem><FormLabel>Palpation</FormLabel><FormControl><Input placeholder="e.g., Soft, non-tender" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="extraocularMusclesOS" render={({ field }) => (<FormItem><FormLabel>Extraocular Muscles (EOMs)</FormLabel><FormControl><Input placeholder="e.g., Full" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="grossExaminationOS" render={({ field }) => (<FormItem><FormLabel>Gross Examination</FormLabel><FormControl><Textarea placeholder="e.g., Lids normal, Conjunctiva clear, Cornea transparent" {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </div>

              <SectionHeader title="Anterior Eye Image(s)" icon={<ImageIcon className="h-6 w-6 text-primary" />} />
              <FormItem>
                <FormLabel>Upload Eye Image(s) (At least 1 required, up to {MAX_IMAGES})</FormLabel>
                <FormControl>
                  <div className="flex items-center justify-center w-full">
                      <label 
                        htmlFor="dropzone-file" 
                        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer 
                                    ${isDraggingOver ? 'border-primary bg-primary/10' : 'border-border bg-muted/50 hover:bg-muted'}
                                    ${uploadedImages.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onDragEnter={uploadedImages.length < MAX_IMAGES ? handleDragEnter : undefined} 
                        onDragLeave={uploadedImages.length < MAX_IMAGES ? handleDragLeave : undefined} 
                        onDragOver={uploadedImages.length < MAX_IMAGES ? handleDragOver : undefined} 
                        onDrop={uploadedImages.length < MAX_IMAGES ? handleDrop : undefined}
                      >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                {uploadedImages.length >= MAX_IMAGES 
                                  ? `Maximum ${MAX_IMAGES} images uploaded`
                                  : <><span className="font-semibold">Click to upload</span> or drag and drop</>
                                }
                              </p>
                              <p className="text-xs text-muted-foreground">JPEG, PNG, GIF, WEBP (MAX. 5MB each)</p>
                              <p className="text-xs text-muted-foreground">Uploaded: {uploadedImages.length}/{MAX_IMAGES}</p>
                          </div>
                          <Input id="dropzone-file" type="file" className="hidden" accept="image/*" multiple onChange={handleImageInputChange} ref={fileInputRef} disabled={uploadedImages.length >= MAX_IMAGES} />
                      </label>
                  </div>
                </FormControl>
                <FormDescription>Capture clear photos of the anterior eye. Ensure good lighting. Select one image as primary for AI analysis.</FormDescription>
                {imageError && <FormMessage className="text-destructive flex items-center gap-1"><AlertCircle size={16}/> {imageError}</FormMessage>}
              </FormItem>

              {uploadedImages.length > 0 && (
                <div className="mt-4 p-4 border rounded-md bg-muted/30">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><ImageIcon size={16} />Uploaded Images:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className={`relative border-2 p-2 rounded-md ${primaryImageId === image.id ? 'border-primary shadow-lg' : 'border-border'}`}>
                        <Image src={image.preview} alt={`Eye image preview ${image.file.name}`} width={150} height={150} className="rounded-md object-contain w-full h-32" />
                        <div className="mt-2 flex flex-col space-y-1.5">
                           <Button 
                            type="button" 
                            variant={primaryImageId === image.id ? "default" : "outline"} 
                            size="sm"
                            onClick={() => handleSetPrimaryImage(image.id)}
                            disabled={primaryImageId === image.id}
                            className="w-full text-xs"
                          >
                            <Star className={`mr-1.5 h-3.5 w-3.5 ${primaryImageId === image.id ? 'fill-yellow-400 text-yellow-500' : ''}`} />
                            {primaryImageId === image.id ? "Primary" : "Set as Primary"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleRemoveImage(image.id)}
                            className="w-full text-xs"
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
                          </Button>
                        </div>
                         {primaryImageId === image.id && (
                            <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" /> Primary
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 truncate" title={image.file.name}>{image.file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button type="submit" className="w-full md:w-auto" disabled={isProcessing}>
                {isProcessing ? "Processing AI Triage..." : "Perform AI Triage"}
              </Button>
            </form>
          </Form>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

    

    