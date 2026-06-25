
import Link from 'next/link';
import AppLogo from './AppLogo';
import { ThemeToggleButton } from './ThemeToggleButton';

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <AppLogo />
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
          <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About</Link>
          <Link href="/support" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
            <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
