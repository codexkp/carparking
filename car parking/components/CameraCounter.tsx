'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Video, RefreshCw, Car } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { countVehicles } from '@/ai/flows/count-vehicles-flow';
import { updateOccupancy } from '@/app/actions';
import type { ParkingZone } from '@/lib/parking';

export default function CameraCounter({ zones }: { zones: ParkingZone[] }) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      zoneId: zones[0]?.id || '',
    },
  });

  const selectedZoneId = form.watch('zoneId');
  const selectedZone = zones.find(z => z.id === selectedZoneId);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        return;
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  };

  const handleCountVehicles = async () => {
    const photoDataUri = captureFrame();
    if (!photoDataUri) {
      toast({ variant: 'destructive', title: 'Could not capture photo', description: 'Please ensure camera is working.' });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { vehicleCount } = await countVehicles({ photoDataUri });
      
      const formData = new FormData();
      formData.append('zoneId', selectedZoneId);
      formData.append('occupiedSpaces', vehicleCount.toString());

      startTransition(() => {
        updateOccupancy(formData);
      });

      toast({
        title: "Update Sent",
        description: `Detected ${vehicleCount} vehicle(s). Updating availability for ${selectedZone?.name}.`,
      });

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Counting Error",
        description: "An unexpected error occurred while counting vehicles. Please try again.",
      });
      console.error("Counting error:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const isLoading = isProcessing || isPending;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><Video /> Camera Vehicle Counter</CardTitle>
        <CardDescription>
          Use your camera to count vehicles in a zone and update its availability in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="space-y-4">
                 <Form {...form}>
                    <FormField
                        control={form.control}
                        name="zoneId"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Parking Zone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a zone" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {zones.map(zone => (
                                    <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </FormItem>
                        )}
                    />
                </Form>
                 {selectedZone && (
                  <div className="text-sm p-3 bg-muted/50 rounded-lg">
                    <p>Total spaces in <strong>{selectedZone.name}</strong>: {selectedZone.totalSpaces}</p>
                    <p className='text-muted-foreground'>Point your camera at the parking area and click "Count Vehicles".</p>
                  </div>
                )}
            </div>

            <div>
              <div className="aspect-video w-full bg-secondary rounded-md overflow-hidden flex items-center justify-center relative">
                {hasCameraPermission === null && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p>Requesting camera access...</p>
                  </div>
                )}
                
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                
                {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="mt-2 font-semibold">{isProcessing ? "Analyzing Image..." : "Updating server..."}</p>
                    </div>
                )}
              </div>
              {hasCameraPermission === false && (
                  <Alert variant="destructive" className="mt-2">
                    <Camera className="h-4 w-4"/>
                    <AlertTitle>Camera Access Denied</AlertTitle>
                    <AlertDescription>
                      Enable camera permissions to use this feature.
                    </AlertDescription>
                  </Alert>
              )}
            </div>
        </div>
        <Button 
            onClick={handleCountVehicles}
            className="w-full"
            size="lg"
            disabled={!hasCameraPermission || isLoading || !selectedZoneId}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Car className="mr-2 h-4 w-4" />
            )}
            {isLoading ? (isProcessing ? 'Counting...' : 'Updating...') : 'Count Vehicles & Update Availability'}
        </Button>
      </CardContent>
    </Card>
  );
}
