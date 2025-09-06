import { getParkingZoneById } from '@/lib/parking';
import { notFound } from 'next/navigation';
import VerificationClient from './VerificationClient';
import Link from 'next/link';
import { ArrowLeft, IdCard } from 'lucide-react';

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const zone = await getParkingZoneById(params.id);

  if (!zone) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
       <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all zones
        </Link>
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <IdCard className="w-8 h-8 text-primary" />
            Identity Verification
          </h1>
          <p className="text-muted-foreground">
            Please verify your identity and vehicle to proceed with booking for{' '}
            <strong>{zone.name}</strong>.
          </p>
        </div>
        <VerificationClient zoneId={zone.id} />
      </div>
    </div>
  );
}
