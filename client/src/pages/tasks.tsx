import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TaskCard } from "@/components/dashboard/task-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, CheckCircle, CheckCircle2, Clock, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Define schema for task form
const taskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  dueDate: z.date({
    required_error: "Please select a date and time",
  }),
  dueTime: z.string().min(1, "Please select a time"),
  recurrence: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Create task form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: new Date(),
      dueTime: "08:00",
      recurrence: "",
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      // Combine date and time
      const dueDate = new Date(data.dueDate);
      const [hours, minutes] = data.dueTime.split(':').map(Number);
      dueDate.setHours(hours, minutes);
      
      return await apiRequest("POST", "/api/tasks", {
        title: data.title,
        description: data.description,
        dueDate: dueDate.toISOString(),
        recurrence: data.recurrence,
      });
    },
    onSuccess: () => {
      toast({
        title: "Task added",
        description: "Your task has been successfully added.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setDialogOpen(false);
      form.reset({
        title: "",
        description: "",
        dueDate: new Date(),
        dueTime: "08:00",
        recurrence: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: TaskFormValues) => {
    createTaskMutation.mutate(data);
  };

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task: any) => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return task.isCompleted;
    if (activeTab === "upcoming") {
      const dueDate = new Date(task.dueDate);
      return !task.isCompleted && dueDate > new Date();
    }
    if (activeTab === "overdue") {
      const dueDate = new Date(task.dueDate);
      return !task.isCompleted && dueDate <= new Date();
    }
    return true;
  });

  // Group tasks by date
  const groupedTasks: Record<string, any[]> = {};
  
  filteredTasks.forEach((task: any) => {
    const dueDate = new Date(task.dueDate);
    const dateKey = format(dueDate, 'yyyy-MM-dd');
    
    if (!groupedTasks[dateKey]) {
      groupedTasks[dateKey] = [];
    }
    
    groupedTasks[dateKey].push(task);
  });
  
  // Sort dates
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );
  
  // Sort tasks within each date by time
  sortedDates.forEach(date => {
    groupedTasks[date].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-neutral-800">Tasks</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task with a reminder to help you remember important activities.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Morning Exercise, Call Family" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Gentle stretching for 15 minutes"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dueTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="recurrence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repeat (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select recurrence pattern" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No repetition</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose how often this task should repeat.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTaskMutation.isPending}>
                    {createTaskMutation.isPending ? "Adding..." : "Add Task"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Task Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed" className="text-success">
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="text-warning">
                <Clock className="h-4 w-4 mr-1" />
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="overdue" className="text-destructive">
                <Clock className="h-4 w-4 mr-1" />
                Overdue
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                  <p className="mt-4 text-neutral-600">Loading tasks...</p>
                </div>
              ) : sortedDates.length > 0 ? (
                <div className="space-y-8">
                  {sortedDates.map(dateKey => (
                    <div key={dateKey}>
                      <h3 className="text-lg font-medium text-neutral-800 mb-4 flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary-600" />
                        {format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
                        <span className="text-sm font-normal text-neutral-500">
                          ({groupedTasks[dateKey].length} tasks)
                        </span>
                      </h3>
                      <div className="space-y-4">
                        {groupedTasks[dateKey].map((task: any) => (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onActionComplete={() => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] })}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-lg">
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">No tasks found</h3>
                  <p className="text-neutral-600 mb-4">
                    {activeTab === "all" 
                      ? "You haven't added any tasks yet"
                      : activeTab === "completed"
                      ? "No completed tasks yet"
                      : activeTab === "upcoming"
                      ? "No upcoming tasks scheduled"
                      : "No overdue tasks"
                    }
                  </p>
                  {activeTab === "all" && (
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Task
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Task Tips */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">Tips for Daily Activities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="bg-primary-100 p-3 rounded-full h-fit">
                <CheckCircle2 className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-1">Follow a Routine</h3>
                <p className="text-neutral-600">
                  Maintain a consistent daily schedule to reduce confusion and anxiety.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-primary-100 p-3 rounded-full h-fit">
                <CheckCircle2 className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-1">Use Visual Reminders</h3>
                <p className="text-neutral-600">
                  Place notes, pictures, or labeled items around the home as reminders.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-primary-100 p-3 rounded-full h-fit">
                <CheckCircle2 className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-1">Break Down Tasks</h3>
                <p className="text-neutral-600">
                  Divide complex activities into smaller, manageable steps.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-primary-100 p-3 rounded-full h-fit">
                <CheckCircle2 className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-1">Physical Activity</h3>
                <p className="text-neutral-600">
                  Include gentle exercise daily, like walking or stretching, to improve wellbeing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
