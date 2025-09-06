'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function BookingStatusHandler() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const success = searchParams.get('success');
    const message = searchParams.get('message');
    
    // Only show a toast for failures. Success is handled inline on the page.
    if (success === 'false' && message) {
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: decodeURIComponent(message),
      });
      
      // Clean up URL params
      const newPath = window.location.pathname;
      window.history.replaceState({...window.history.state, as: newPath, url: newPath}, '', newPath);
    }
  }, [searchParams, toast]);

  return null; // This component does not render anything
}
