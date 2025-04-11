
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CaretakerProfile } from "@/components/dashboard/caretaker-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function CaretakerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  
  const { data: caretaker, isLoading, error } = useQuery({
    queryKey: [`/api/caretakers/${id}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleBack = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !caretaker) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-6 text-center text-neutral-600">
            Failed to load caretaker profile. Please try again later.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={handleBack}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Card>
        <CardContent className="p-6">
          <CaretakerProfile caretaker={caretaker} showActions={true} />
        </CardContent>
      </Card>
    </div>
  );
}
