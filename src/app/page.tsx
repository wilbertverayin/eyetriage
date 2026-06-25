
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, MessageSquare, ExternalLink } from "lucide-react";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleGetStartedClick = () => {
    router.push('/dashboard');
  };

  const handleSuggestionSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    toast({
      title: "Feedback Sent!",
      description: "Thank you for your suggestion. We appreciate your input.",
    });
    form.reset();
  };

  return (
    <>
      <div className="relative isolate min-h-screen flex items-center justify-center overflow-hidden bg-background px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/4 left-0 h-[50rem] w-[50rem] rounded-full bg-gradient-radial from-primary/20 to-transparent blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/4 h-[50rem] w-[50rem] rounded-full bg-gradient-radial from-amber-400/20 to-transparent blur-3xl animate-pulse" />
        </div>
        <div className="mx-auto max-w-4xl py-24 sm:py-32 lg:py-40">
          <div className="grid grid-cols-1 items-center gap-12">
            <div className="text-center">
              <Badge variant="outline" className="mb-4 border-primary/50 text-primary bg-primary/10">
                Our Mission
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl font-headline">
                EyeTriage: Where Vision Meets AI
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                EyeTriage is a grassroots initiative by Filipino doctors and developers, dedicated to empowering healthcare professionals in rural and underserved communities. Our goal is to provide intelligent eye triage and referral decision support using AI, enabling timely and accurate eye care.
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                <p className="font-semibold">Disclaimer:</p>
                <p>This tool is intended for use by qualified health professionals as a decision support tool and is not a substitute for professional medical judgment. All diagnoses and treatment decisions remain the responsibility of the healthcare provider. No patient data or images you enter are saved or stored by this application.</p>
              </div>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" onClick={handleGetStartedClick} className="text-lg font-bold py-4 px-10 rounded-full shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/50 hover:scale-105 active:scale-100">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-24 sm:py-32 bg-muted/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">Support & Feedback</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
              Help Us Improve
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Your support helps us maintain and enhance this tool. We also welcome your suggestions to make EyeTriage better.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              <div className="flex flex-col items-start p-6 rounded-lg bg-card shadow-md">
                <div className="flex items-center gap-x-3">
                  <Heart className="h-8 w-8 text-primary" />
                  <dt className="text-xl font-semibold leading-7 text-foreground">Support Us</dt>
                </div>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">Your generous contributions help us cover server costs and further development. Every bit helps us on our mission.</p>
                  <p className="mt-6">
                    <Button asChild>
                      <Link href="/support">
                        Donate Now <ExternalLink className="ml-2" />
                      </Link>
                    </Button>
                  </p>
                </dd>
              </div>
              <div className="flex flex-col items-start p-6 rounded-lg bg-card shadow-md">
                <div className="flex items-center gap-x-3">
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <dt className="text-xl font-semibold leading-7 text-foreground">Suggestions & Feedback</dt>
                </div>
                <dd className="mt-4 flex w-full flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">Have an idea or a suggestion? We'd love to hear from you. Your feedback is invaluable in shaping the future of EyeTriage.</p>
                  <form onSubmit={handleSuggestionSubmit} className="mt-6 space-y-4 text-left">
                    <div>
                      <Label htmlFor="suggestion-text" className="text-sm font-medium text-foreground">
                        Your Suggestion
                      </Label>
                      <Textarea
                        id="suggestion-text"
                        placeholder="Tell us how we can improve..."
                        required
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="suggestion-email" className="text-sm font-medium text-foreground">
                        Your Email (Optional)
                      </Label>
                      <Input
                        type="email"
                        id="suggestion-email"
                        placeholder="you@example.com"
                        className="mt-1"
                      />
                    </div>
                    <Button type="submit" variant="secondary" className="w-full">
                      Send Feedback
                    </Button>
                  </form>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
