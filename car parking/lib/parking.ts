import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';

export interface ParkingZone {
  id: string;
  name: string;
  location: string;
  totalSpaces: number;
  availableSpaces: number;
  rules: string;
}

// In-memory "database"
let parkingZones: ParkingZone[] = [
  { id: 'zone-a', name: 'Ghat Zone A', location: 'Near Ram Ghat', totalSpaces: 100, availableSpaces: 75, rules: 'Two-wheelers only. Maximum 4 hours parking.' },
  { id: 'zone-b', name: 'Market Zone B', location: 'Central Market Area', totalSpaces: 50, availableSpaces: 10, rules: 'Four-wheelers only. This is a paid parking zone.' },
  { id: 'zone-c', name: 'Temple Zone C', location: 'Close to Mahakal Temple', totalSpaces: 200, availableSpaces: 150, rules: 'Open 24/7. Free for pilgrims with a valid pass.' },
  { id: 'zone-d', name: 'Residential Zone D', location: 'Ankpat Marg', totalSpaces: 30, availableSpaces: 0, rules: 'Reserved for residents with a valid permit only.' },
];

// Use noStore to prevent caching of this data, ensuring it's always "live"
export async function getParkingZones(): Promise<ParkingZone[]> {
  noStore();
  return JSON.parse(JSON.stringify(parkingZones)); // Deep copy to prevent mutation
}

export async function getParkingZoneById(id: string): Promise<ParkingZone | undefined> {
  noStore();
  const zone = parkingZones.find(zone => zone.id === id);
  return zone ? JSON.parse(JSON.stringify(zone)) : undefined;
}

export async function bookSpot(id: string): Promise<{ success: boolean; message: string; zone?: ParkingZone }> {
  noStore();
  const zone = parkingZones.find(zone => zone.id === id);
  if (!zone) {
    return { success: false, message: 'Parking zone not found.' };
  }
  if (zone.availableSpaces > 0) {
    zone.availableSpaces--;
    return { success: true, message: `Booking confirmed for ${zone.name}. One spot reserved.`, zone: JSON.parse(JSON.stringify(zone)) };
  }
  return { success: false, message: 'Sorry, no available spaces left in this zone.' };
}

export async function updateOccupancy(id: string, occupiedSpaces: number): Promise<{ success: boolean; }> {
  noStore();
  const zone = parkingZones.find(zone => zone.id === id);
  if (zone) {
    const newAvailable = zone.totalSpaces - occupiedSpaces;
    zone.availableSpaces = Math.max(0, Math.min(newAvailable, zone.totalSpaces));
    return { success: true };
  }
  return { success: false };
}
