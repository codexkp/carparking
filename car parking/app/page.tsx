import { getParkingZones } from '@/lib/parking';
import ParkingCard from '@/components/ParkingCard';

export default async function Home() {
  const parkingZones = await getParkingZones();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold font-headline mb-2">
        Parking Availability
      </h1>
      <p className="text-muted-foreground mb-8">
        Real-time status of parking zones.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parkingZones.map(zone => (
          <ParkingCard key={zone.id} zone={zone} />
        ))}
      </div>
    </div>
  );
}
