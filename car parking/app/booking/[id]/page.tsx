import { getParkingZoneById } from '@/lib/parking';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { handleBooking } from '@/app/actions';
import { ArrowLeft, Car, CheckCircle, MapPin, Scale } from 'lucide-react';
import Link from 'next/link';
import BookingStatusHandler from './BookingStatusHandler';

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const zone = await getParkingZoneById(params.id);

  if (!zone) {
    notFound();
  }

  const isBookingSuccessful = searchParams.success === 'true';
  const isFullyBooked = zone.availableSpaces === 0;

  return (
    <>
      <BookingStatusHandler />
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all zones
        </Link>
        <Card className="max-w-2xl mx-auto shadow-lg animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline">
              {zone.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {zone.location}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="text-sm text-muted-foreground">Available Spaces</p>
                <p className="text-4xl font-bold">{zone.availableSpaces}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-4xl font-bold text-muted-foreground">
                  {zone.totalSpaces}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Scale className="w-4 h-4" /> Parking Rules
              </h3>
              <p className="text-muted-foreground">{zone.rules}</p>
            </div>

            {isBookingSuccessful && (
              <div className="p-4 rounded-lg bg-primary/10 flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <h3 className="font-bold text-primary">Booking Successful!</h3>
                  <p className="text-sm text-primary/80">
                    {decodeURIComponent(searchParams.message as string)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          {!isBookingSuccessful && (
            <CardFooter>
              <form action={handleBooking} className="w-full">
                <input type="hidden" name="zoneId" value={zone.id} />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg"
                  disabled={isFullyBooked}
                >
                  <Car className="w-5 h-5 mr-2" />
                  {isFullyBooked ? 'No Spaces Available' : 'Confirm Booking'}
                </Button>
              </form>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
}
