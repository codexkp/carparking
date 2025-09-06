'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Check, User, Phone, Car } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { VerifyIdentityInput, verifyIdentity } from '@/ai/flows/verify-identity-flow';
import { z } from 'zod';

const OmittedVerifyIdentityInputSchema = z.object({
  vehicleNumber: z.string().min(1, 'Vehicle number is required.'),
  mobileNumber: z.string().min(10, 'Mobile number must be 10 digits.').max(10, 'Mobile number must be 10 digits.'),
});

export default function VerificationClient({ zoneId }: { zoneId: string }) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<Omit<VerifyIdentityInput, 'userPhotoDataUri'>>({
    resolver: zodResolver(OmittedVerifyIdentityInputSchema),
    defaultValues: {
      vehicleNumber: '',
      mobileNumber: '',
    },
  });

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
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
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

  const onSubmit = async (data: Omit<VerifyIdentityInput, 'userPhotoDataUri'>) => {
    const userPhotoDataUri = captureFrame();
    if (!userPhotoDataUri) {
      toast({ variant: 'destructive', title: 'Could not capture photo', description: 'Please ensure camera is working.' });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const result = await verifyIdentity({
        ...data,
        userPhotoDataUri,
      });

      if (result.isVerified) {
        toast({
            title: "Verification Successful",
            description: result.reason,
        });
        router.push(`/booking/${zoneId}`);
      } else {
        toast({
            variant: "destructive",
            title: "Verification Failed",
            description: result.reason,
        });
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Verification Error",
        description: "An unexpected error occurred during verification. Please try again.",
      });
      console.error("Verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Identity & Vehicle Verification</CardTitle>
            <CardDescription>
              Provide your details and look at the camera for verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
                control={form.control}
                name="vehicleNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Car/> Vehicle Number</FormLabel>
                    <FormControl>
                      <Input placeholder="MH-12-AB-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Phone/> Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
            <div>
              <FormLabel className="flex items-center gap-2 mb-2"><Camera/> Camera Preview & Face Recognition</FormLabel>
              <div className="aspect-video w-full bg-secondary rounded-md overflow-hidden flex items-center justify-center">
                {hasCameraPermission === null && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p>Requesting camera access...</p>
                  </div>
                )}
                
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                
              </div>
              {hasCameraPermission === false && (
                  <Alert variant="destructive" className="mt-4">
                    <Camera className="h-4 w-4"/>
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                      Please allow camera access to use this feature.
                    </AlertDescription>
                  </Alert>
                )}
            </div>
            
          </CardContent>
          <CardFooter>
            <Button 
              type="submit"
              className="w-full"
              size="lg"
              disabled={!hasCameraPermission || isVerifying}
            >
              {isVerifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              {isVerifying ? 'Verifying...' : 'Complete Verification'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
