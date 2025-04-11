import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MedicationCard } from "@/components/dashboard/medication-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { TimePickerInput } from "@/components/ui/time-picker-input";

// Define schema for medication form
const medicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dosage: z.string().min(1, "Dosage is required"),
  schedule: z.array(z.string()).min(1, "At least one time is required"),
  instructions: z.string().optional(),
});

type MedicationFormValues = z.infer<typeof medicationSchema>;

export default function MedicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(['08:00']); // Default first time

  // Fetch medications
  const { data: medications = [], isLoading } = useQuery({
    queryKey: ["/api/medications"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Add a new time input field
  const addTimeField = () => {
    setScheduleTimes([...scheduleTimes, '']);
  };

  // Remove a time input field
  const removeTimeField = (index: number) => {
    const newTimes = [...scheduleTimes];
    newTimes.splice(index, 1);
    setScheduleTimes(newTimes);
  };

  // Update a time value
  const updateTimeValue = (index: number, value: string) => {
    const newTimes = [...scheduleTimes];
    newTimes[index] = value;
    setScheduleTimes(newTimes);
    form.setValue('schedule', newTimes);
  };

  // Create medication form
  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      schedule: scheduleTimes,
      instructions: "",
    },
  });

  // Create medication mutation
  const createMedicationMutation = useMutation({
    mutationFn: async (data: MedicationFormValues) => {
      return await apiRequest("POST", "/api/medications", {
        ...data,
        schedule: JSON.stringify(data.schedule),
      });
    },
    onSuccess: () => {
      toast({
        title: "Medication added",
        description: "Your medication has been successfully added.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      setDialogOpen(false);
      form.reset();
      setScheduleTimes(['08:00']); // Reset to default
    },
    onError: (error) => {
      toast({
        title: "Failed to add medication",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: MedicationFormValues) => {
    data.schedule = scheduleTimes.filter(time => time !== '');
    createMedicationMutation.mutate(data);
  };

  // Filter medications based on active tab
  const filteredMedications = medications.filter((med: any) => {
    if (activeTab === "all") return true;
    if (activeTab === "taken") return med.takenToday;
    if (activeTab === "upcoming") return !med.takenToday && med.isUpcoming;
    if (activeTab === "overdue") return !med.takenToday && !med.isUpcoming;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-neutral-800">Medications</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
              <DialogDescription>
                Add your medication details and set up reminders for when to take it.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Aricept, Namenda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 10mg - 1 tablet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule</FormLabel>
                      <FormDescription>
                        Set the times when you need to take this medication.
                      </FormDescription>
                      <div className="space-y-2">
                        {scheduleTimes.map((time, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex-1">
                              <Input
                                type="time"
                                value={time}
                                onChange={(e) => updateTimeValue(index, e.target.value)}
                                className="w-full"
                              />
                            </div>
                            {scheduleTimes.length > 1 && (
                              <Button 
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeTimeField(index)}
                              >
                                −
                              </Button>
                            )}
                            {index === scheduleTimes.length - 1 && (
                              <Button 
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={addTimeField}
                              >
                                +
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Take with food, avoid grapefruit juice"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMedicationMutation.isPending}>
                    {createMedicationMutation.isPending ? "Adding..." : "Add Medication"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Medication Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="taken" className="text-success">
                <CheckCircle className="h-4 w-4 mr-1" />
                Taken
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="text-warning">
                <Clock className="h-4 w-4 mr-1" />
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="overdue" className="text-destructive">
                <AlertCircle className="h-4 w-4 mr-1" />
                Overdue
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                  <p className="mt-4 text-neutral-600">Loading medications...</p>
                </div>
              ) : filteredMedications.length > 0 ? (
                <div className="space-y-4">
                  {filteredMedications.map((medication: any) => (
                    <MedicationCard 
                      key={medication.id} 
                      medication={medication} 
                      onActionComplete={() => queryClient.invalidateQueries({ queryKey: ["/api/medications"] })}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-lg">
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">No medications found</h3>
                  <p className="text-neutral-600 mb-4">
                    {activeTab === "all" 
                      ? "You haven't added any medications yet"
                      : activeTab === "taken"
                      ? "No medications marked as taken today"
                      : activeTab === "upcoming"
                      ? "No upcoming medications scheduled"
                      : "No overdue medications"
                    }
                  </p>
                  {activeTab === "all" && (
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Medication
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Medication Tips */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">Medication Tips</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="bg-primary-100 p-3 rounded-full h-fit">
                <CheckCircle className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-1">Set a Routine</h3>
                <p className="text-neutral-600">
                  Take medications at the same time each day to help establish a consistent routine.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-primary-100 p-3 rounded-full h-fit">
                <CheckCircle className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-1">Use Pill Organizers</h3>
                <p className="text-neutral-600">
                  Weekly pill organizers can help you keep track of which medications you've taken.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-primary-100 p-3 rounded-full h-fit">
                <CheckCircle className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-1">Keep a List</h3>
                <p className="text-neutral-600">
                  Maintain a list of all your medications to share with healthcare providers.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-primary-100 p-3 rounded-full h-fit">
                <CheckCircle className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-1">Check Interactions</h3>
                <p className="text-neutral-600">
                  Always inform your doctor about all medications you're taking to avoid interactions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
