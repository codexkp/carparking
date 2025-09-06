import type { ParkingZone } from '@/lib/parking';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ParkingCardProps {
  zone: ParkingZone;
}

export default function ParkingCard({ zone }: ParkingCardProps) {
  const isAvailable = zone.availableSpaces > 0;
  const availabilityPercentage =
    zone.totalSpaces > 0
      ? (zone.availableSpaces / zone.totalSpaces) * 100
      : 0;

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 motion-safe:hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="font-headline">{zone.name}</CardTitle>
        <CardDescription className="flex items-center gap-1.5 pt-1">
          <MapPin className="w-4 h-4" />
          {zone.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-muted-foreground">Available</span>
            <span className="font-bold">
              {zone.availableSpaces} / {zone.totalSpaces}
            </span>
          </div>
          <Progress
            value={availabilityPercentage}
            aria-label={`${availabilityPercentage.toFixed(0)}% available`}
            className={!isAvailable ? '[&>div]:bg-destructive' : ''}
          />
        </div>
        <p
          className={`text-sm font-semibold ${isAvailable ? 'text-primary' : 'text-destructive'}`}
        >
          {isAvailable ? 'Spaces available' : 'Parking full'}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/verify/${zone.id}`}>
            Book Now <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
