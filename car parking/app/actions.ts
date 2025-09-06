'use server';

import { revalidatePath } from 'next/cache';
import {
  bookSpot as bookSpotInDb,
  updateOccupancy as updateOccupancyInDb,
} from '@/lib/parking';
import { redirect } from 'next/navigation';

export async function handleBooking(formData: FormData) {
  const zoneId = formData.get('zoneId') as string;
  if (!zoneId) {
    return redirect(
      `/?success=false&message=${encodeURIComponent('Invalid zone ID.')}`
    );
  }
  const result = await bookSpotInDb(zoneId);
  if (result.success) {
    revalidatePath('/');
    revalidatePath(`/booking/${zoneId}`);
    // Redirect with a success message
    redirect(
      `/booking/${zoneId}?success=true&message=${encodeURIComponent(result.message)}`
    );
  } else {
    // Redirect with a failure message
    redirect(
      `/booking/${zoneId}?success=false&message=${encodeURIComponent(result.message)}`
    );
  }
}

export async function updateOccupancy(formData: FormData) {
  const zoneId = formData.get('zoneId') as string;
  const occupiedSpaces = parseInt(formData.get('occupiedSpaces') as string, 10);

  if (zoneId && !isNaN(occupiedSpaces)) {
    await updateOccupancyInDb(zoneId, occupiedSpaces);
    revalidatePath('/');
    revalidatePath(`/booking/${zoneId}`);
  }
}
