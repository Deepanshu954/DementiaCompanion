import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pill, Clock, Check, Trash2, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { format } from "date-fns";

export interface MedicationProps {
  id: number;
  name: string;
  dosage: string;
  schedule: string;
  instructions?: string;
  userId: number;
  takenToday: boolean;
  nextDose?: string;
  isUpcoming: boolean;
}

export function MedicationCard({ medication, onActionComplete }: { 
  medication: MedicationProps;
  onActionComplete?: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  // Calculate status color based on next dose time
  const getStatusColor = () => {
    if (medication.takenToday) return "text-success";
    if (medication.isUpcoming) return "text-warning";
    return "text-danger";
  };
  
  // Take medication mutation
  const takeMedicationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST", 
        `/api/medications/${medication.id}/logs`,
        {}
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Medication logged",
        description: `You've marked ${medication.name} as taken.`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      if (onActionComplete) onActionComplete();
    },
    onError: (error) => {
      toast({
        title: "Failed to log medication",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete medication mutation
  const deleteMedicationMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/medications/${medication.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Medication deleted",
        description: `${medication.name} has been removed from your list.`,
        variant: "default",
      });
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      if (onActionComplete) onActionComplete();
    },
    onError: (error) => {
      toast({
        title: "Failed to delete medication",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleTakeMedication = () => {
    takeMedicationMutation.mutate();
  };
  
  const handleDeleteMedication = () => {
    deleteMedicationMutation.mutate();
  };
  
  // Parse schedule if it's a JSON string
  let scheduleDisplay = "No schedule set";
  try {
    if (medication.schedule) {
      const parsedSchedule = JSON.parse(medication.schedule);
      if (Array.isArray(parsedSchedule)) {
        scheduleDisplay = parsedSchedule.join(", ");
      }
    }
  } catch (e) {
    scheduleDisplay = medication.schedule;
  }
  
  return (
    <Card className={`border-2 ${medication.takenToday ? 'border-green-100' : 'border-primary-100'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`bg-primary-100 p-3 rounded-full mr-4`}>
              <Pill className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-neutral-800">{medication.name}</h3>
              <p className="text-neutral-600">{medication.dosage}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center mb-1">
              <Clock className={`h-4 w-4 ${getStatusColor()} mr-1`} />
              <span className={`font-medium ${getStatusColor()}`}>
                {medication.takenToday 
                  ? "Taken today" 
                  : medication.nextDose 
                    ? medication.nextDose 
                    : "Overdue"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {!medication.takenToday && (
                <Button 
                  onClick={handleTakeMedication}
                  disabled={takeMedicationMutation.isPending}
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark as taken
                </Button>
              )}
              
              <Link href={`/medications/${medication.id}`}>
                <Button size="icon" variant="outline">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
              
              <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogTrigger asChild>
                  <Button size="icon" variant="outline" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Medication</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {medication.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteMedication}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleteMedicationMutation.isPending}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-neutral-600">
          <p><span className="font-medium">Schedule:</span> {scheduleDisplay}</p>
          {medication.instructions && (
            <p className="mt-1"><span className="font-medium">Instructions:</span> {medication.instructions}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
