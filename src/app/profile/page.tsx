
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BriefcaseMedical, Mail, Phone, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  // Placeholder user data - now generic
  const user = {
    name: "Your Name",
    email: "your.email@example.com",
    role: "Your Role",
    avatarUrl: "https://placehold.co/100x100.png", // Generic placeholder image
    phone: "(+XX) XXX XXX XXXX",
    specialty: "Your Specialty",
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile picture" />
            <AvatarFallback>{user.name ? user.name.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
          <CardTitle className="font-headline text-3xl">{user.name}</CardTitle>
          <CardDescription className="text-lg text-primary">{user.role}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-headline text-xl text-foreground/90">Contact Information</h3>
            <div className="flex items-center space-x-3 text-muted-foreground">
              <Mail className="w-5 h-5 text-primary" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-muted-foreground">
              <Phone className="w-5 h-5 text-primary" />
              <span>{user.phone}</span>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-headline text-xl text-foreground/90">Professional Details</h3>
            <div className="flex items-center space-x-3 text-muted-foreground">
              <BriefcaseMedical className="w-5 h-5 text-primary" />
              <span>{user.specialty}</span>
            </div>
          </div>
          <Button className="w-full" variant="outline">Edit Profile (Placeholder)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
