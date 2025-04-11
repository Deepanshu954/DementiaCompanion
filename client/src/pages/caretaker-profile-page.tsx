
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { CaretakerProfile } from "@/components/dashboard/caretaker-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function CaretakerProfilePage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: caretaker, isLoading, error } = useQuery({
    queryKey: [`/api/caretakers/${id}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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
      <Card>
        <CardContent className="p-6">
          <CaretakerProfile caretaker={caretaker} showActions={true} />
        </CardContent>
      </Card>
    </div>
  );
}
