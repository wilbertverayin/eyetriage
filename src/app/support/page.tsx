
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ScanLine, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function SupportPage() {
  // Details removed as per request

  return (
    <div className="flex flex-col items-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="font-headline text-3xl">Support EyeTriage</CardTitle>
          <CardDescription>
            Your generous contributions help us improve and maintain EyeTriage. Thank you for your support!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-center mb-2 text-foreground/90">Donate via GCash</h3>
            <div className="p-4 border-2 border-dashed border-primary rounded-lg bg-primary/5">
              <Image
                src="/donate.jpeg" 
                alt="GCash QR Code for Donations"
                width={350} 
                height={580} 
                className="rounded-md shadow-md object-contain"
                data-ai-hint="donation QR code"
                priority 
              />
            </div>
            <div className="text-center space-y-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-md w-full mt-4">
              <p className="flex items-center justify-center gap-2 text-foreground font-medium text-lg">
                <ScanLine className="h-5 w-5 text-primary" /> Scan to Donate
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="w-full flex flex-col items-center">
            <h3 className="text-xl font-semibold text-center mb-3 text-foreground/90">Donate via Ko-fi</h3>
            <Button asChild size="lg" className="w-full max-w-xs bg-accent hover:bg-accent/90 text-accent-foreground transition-transform hover:scale-105">
              <Link href="https://ko-fi.com/vercodex" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-5 w-5" />
                Donate
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Supports payment via PayPal, card, etc.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
