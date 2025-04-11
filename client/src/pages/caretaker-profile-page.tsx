
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { CaretakerProfile } from "@/components/dashboard/caretaker-profile";
import { Card, CardContent } from "@/components/ui/card";

export default function CaretakerProfilePage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: caretaker } = useQuery({
    queryKey: [`/api/caretakers/${id}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (!caretaker) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8">
      <Card>
        <CardContent className="p-6">
          <CaretakerProfile caretaker={caretaker} />
        </CardContent>
      </Card>
    </div>
  );
}
