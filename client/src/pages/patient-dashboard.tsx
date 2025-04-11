import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { MedicationCard } from "@/components/dashboard/medication-card";
import { TaskCard } from "@/components/dashboard/task-card";
import { CaretakerProfile } from "@/components/dashboard/caretaker-profile";
import { Calendar, ArrowRight } from "lucide-react";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [currentDate] = useState(new Date());

  // Fetch medications
  const { data: medications = [], refetch: refetchMedications } = useQuery({
    queryKey: ["/api/medications"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Fetch tasks
  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ["/api/tasks"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Fetch patient's caretaker assignment
  const { data: assignments = [] } = useQuery({
    queryKey: ["/api/patient/assignments"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Process medications and tasks data for summary
  const totalMedications = medications.length;
  const takenMedications = medications.filter((med: any) => med.takenToday).length;
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task: any) => task.isCompleted).length;
  
  // Get upcoming reminders count
  const upcomingReminders = [
    ...medications.filter((med: any) => !med.takenToday && med.isUpcoming),
    ...tasks.filter((task: any) => !task.isCompleted && new Date(task.dueDate) > new Date())
  ].length;

  // Get current caretaker if assigned
  const activeAssignment = assignments.length > 0 
    ? assignments.find((assignment: any) => assignment.isActive)
    : null;
  const currentCaretaker = activeAssignment?.caretaker;

  // Filter for upcoming medications and tasks
  const upcomingMedications = medications
    .filter((med: any) => !med.takenToday)
    .sort((a: any, b: any) => {
      if (a.isUpcoming && !b.isUpcoming) return -1;
      if (!a.isUpcoming && b.isUpcoming) return 1;
      return 0;
    })
    .slice(0, 2);

  const todaysTasks = tasks
    .filter((task: any) => {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      return taskDate.getDate() === today.getDate() && 
             taskDate.getMonth() === today.getMonth() &&
             taskDate.getFullYear() === today.getFullYear();
    })
    .sort((a: any, b: any) => {
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-neutral-800">
          Welcome back, {user?.fullName?.split(' ')[0]}!
        </h1>
        <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-lg">
          <Calendar className="text-primary-600 h-5 w-5" />
          <span className="font-medium">{format(currentDate, "EEEE, MMMM d, yyyy")}</span>
        </div>
      </div>

      {/* Today's Summary */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">Today's Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard 
              type="medication" 
              completed={takenMedications} 
              total={totalMedications} 
            />
            <SummaryCard 
              type="task" 
              completed={completedTasks} 
              total={totalTasks} 
            />
            <SummaryCard 
              type="upcoming" 
              completed={0} 
              total={upcomingReminders} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Medications */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-neutral-800">Upcoming Medications</h2>
            <Link href="/medications" className="text-primary-600 hover:underline flex items-center">
              See all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {upcomingMedications.length > 0 ? (
              upcomingMedications.map((medication: any) => (
                <MedicationCard 
                  key={medication.id} 
                  medication={medication} 
                  onActionComplete={refetchMedications}
                />
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <p>No upcoming medications</p>
                <Link href="/medications">
                  <Button variant="outline" className="mt-2">
                    Add Medication
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Today's Tasks */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-neutral-800">Today's Tasks</h2>
            <Link href="/tasks" className="text-primary-600 hover:underline flex items-center">
              See all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {todaysTasks.length > 0 ? (
              todaysTasks.map((task: any) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onActionComplete={refetchTasks}
                />
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <p>No tasks scheduled for today</p>
                <Link href="/tasks">
                  <Button variant="outline" className="mt-2">
                    Add Task
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* My Caretaker */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">My Caretaker</h2>
          
          {currentCaretaker && currentCaretaker.profile ? (
            <CaretakerProfile caretaker={{
              ...currentCaretaker.profile,
              user: currentCaretaker
            }} />
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <p>You don't have an assigned caretaker yet</p>
              <Link href="/find-caretakers">
                <Button className="mt-2">
                  Find a Caretaker
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
