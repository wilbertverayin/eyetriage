
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";

export default function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors">
      <Eye className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold">EyeTriage</span>
      <Badge variant="outline" className="text-xs text-primary border-primary/50">Beta</Badge>
    </Link>
  );
}
