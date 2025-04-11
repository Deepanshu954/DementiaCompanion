import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckSquare, Clock, CheckCircle, Trash2, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { format } from "date-fns";

export interface TaskProps {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: number;
  userId: number;
  recurrence?: string;
  icon?: string;
}

export function TaskCard({ task, onActionComplete }: { 
  task: TaskProps;
  onActionComplete?: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get task icon based on title or provided icon
  const getTaskIcon = () => {
    if (task.icon) return task.icon;
    
    const title = task.title.toLowerCase();
    if (title.includes("exercise") || title.includes("stretch")) return "self_improvement";
    if (title.includes("meal") || title.includes("eat") || title.includes("food") || title.includes("lunch") || title.includes("dinner") || title.includes("breakfast")) return "restaurant";
    if (title.includes("call") || title.includes("phone")) return "call";
    if (title.includes("medication") || title.includes("medicine") || title.includes("pill")) return "medication";
    if (title.includes("appointment") || title.includes("doctor") || title.includes("visit")) return "event";
    if (title.includes("read") || title.includes("book")) return "book";
    if (title.includes("walk") || title.includes("outdoors")) return "directions_walk";
    if (title.includes("clean") || title.includes("wash") || title.includes("laundry")) return "cleaning_services";
    
    return "task_alt"; // Default icon
  };
  
  // Format due date
  const formattedDueDate = new Date(task.dueDate);
  const isOverdue = !task.isCompleted && new Date() > formattedDueDate;
  
  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST", 
        `/api/tasks/${task.id}/complete`,
        {}
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Task completed",
        description: `You've marked '${task.title}' as completed.`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (onActionComplete) onActionComplete();
    },
    onError: (error) => {
      toast({
        title: "Failed to complete task",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Task deleted",
        description: `'${task.title}' has been removed from your list.`,
        variant: "default",
      });
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (onActionComplete) onActionComplete();
    },
    onError: (error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleCompleteTask = () => {
    completeTaskMutation.mutate();
  };
  
  const handleDeleteTask = () => {
    deleteTaskMutation.mutate();
  };
  
  return (
    <Card className={`border-2 ${task.isCompleted ? 'border-green-100' : isOverdue ? 'border-red-100' : 'border-neutral-200'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`${task.isCompleted ? 'bg-green-100' : 'bg-neutral-100'} p-3 rounded-full mr-4`}>
              <CheckSquare className={`h-5 w-5 ${task.isCompleted ? 'text-green-600' : 'text-neutral-700'}`} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-neutral-800">{task.title}</h3>
              {task.description && (
                <p className="text-neutral-600">{task.description}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            {task.isCompleted ? (
              <div className="flex items-center mb-1">
                <CheckCircle className="h-4 w-4 text-success mr-1" />
                <span className="font-medium text-success">Completed</span>
              </div>
            ) : (
              <div className="flex items-center mb-1">
                <Clock className={`h-4 w-4 ${isOverdue ? 'text-danger' : 'text-warning'} mr-1`} />
                <span className={`font-medium ${isOverdue ? 'text-danger' : 'text-warning'}`}>
                  {format(formattedDueDate, "h:mm a")}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {!task.isCompleted && (
                <Button 
                  onClick={handleCompleteTask}
                  disabled={completeTaskMutation.isPending}
                  size="sm"
                  variant="secondary"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as done
                </Button>
              )}
              
              <Link href={`/tasks/${task.id}`}>
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
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete '{task.title}'? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteTask}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleteTaskMutation.isPending}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        
        {task.completedAt && (
          <div className="mt-2 text-sm text-neutral-600">
            <span className="font-medium">Completed:</span> {format(new Date(task.completedAt), "MMMM d, yyyy 'at' h:mm a")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
