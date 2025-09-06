import Link from 'next/link';
import { ParkingSquare } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold font-headline text-foreground"
          >
            <ParkingSquare className="w-7 h-7 text-primary" />
            <span>Simhastha Park Smart</span>
          </Link>
          <nav>{/* Navigation items can go here if needed */}</nav>
        </div>
      </div>
    </header>
  );
}
