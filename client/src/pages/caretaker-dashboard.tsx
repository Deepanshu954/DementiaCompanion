import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  ArrowRight, 
  Users, 
  Pill, 
  CheckSquare,
  BellRing, 
  Clock, 
  CheckCircle2 
} from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

export default function CaretakerDashboard() {
  const { user } = useAuth();
  const [currentDate] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);

  // Fetch caretaker assignments
  const { data: assignments = [] } = useQuery({
    queryKey: ["/api/caretaker/assignments"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get active patients
  const activePatients = assignments
    .filter((assignment: any) => assignment.isActive)
    .map((assignment: any) => assignment.patient);

  // Fetch medications for selected patient
  const { data: medications = [] } = useQuery({
    queryKey: ["/api/medications", selectedPatient ? { patientId: selectedPatient } : null],
    enabled: !!selectedPatient,
    staleTime: 1000 * 60, // 1 minute
  });

  // Fetch tasks for selected patient
  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks", selectedPatient ? { patientId: selectedPatient } : null],
    enabled: !!selectedPatient,
    staleTime: 1000 * 60, // 1 minute
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Initialize selected patient if none is selected and patients are available
  useState(() => {
    if (!selectedPatient && activePatients.length > 0) {
      setSelectedPatient(activePatients[0].id);
    }
  });

  // Get patient stats
  const getPatientStats = (patientId: number) => {
    // These would normally come from API calls with the patient ID
    // Currently simulating based on a placeholder mechanism
    return {
      medicationsTaken: Math.floor(Math.random() * 4),
      medicationsTotal: 4,
      tasksCompleted: Math.floor(Math.random() * 3),
      tasksTotal: 3
    };
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Filter recent notifications
  const recentNotifications = notifications
    .filter((notification: any) => {
      // If we have a selected patient, only show notifications related to that patient
      if (selectedPatient) {
        // This is a simplification - in a real app, we'd have patient info in the notification
        return true; 
      }
      return true;
    })
    .slice(0, 5);

  // Get upcoming tasks and medications
  const upcomingItems = [
    ...medications
      .filter((med: any) => !med.takenToday)
      .map((med: any) => ({
        ...med,
        type: "medication",
        dueTime: med.nextDose,
      })),
    ...tasks
      .filter((task: any) => !task.isCompleted)
      .map((task: any) => ({
        ...task,
        type: "task",
        dueTime: format(new Date(task.dueDate), "h:mm a"),
      })),
  ]
    .sort((a, b) => {
      const timeA = a.dueTime ? new Date(`1970/01/01 ${a.dueTime}`) : new Date();
      const timeB = b.dueTime ? new Date(`1970/01/01 ${b.dueTime}`) : new Date();
      return timeA.getTime() - timeB.getTime();
    })
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-neutral-800">
          Welcome, {user?.fullName?.split(' ')[0]}!
        </h1>
        <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-lg">
          <Calendar className="text-primary-600 h-5 w-5" />
          <span className="font-medium">{format(currentDate, "EEEE, MMMM d, yyyy")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* My Patients */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-neutral-800">My Patients</h2>
                <Link href="/caretaker/patients" className="text-primary-600 hover:underline flex items-center">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              {activePatients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activePatients.map((patient: any) => {
                    const stats = getPatientStats(patient.id);
                    return (
                      <div 
                        key={patient.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPatient === patient.id 
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 hover:border-primary-300'
                        }`}
                        onClick={() => setSelectedPatient(patient.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Avatar className="h-12 w-12 mr-4">
                              <AvatarImage src="" alt={patient.fullName} />
                              <AvatarFallback className="bg-primary-100 text-primary-700">
                                {getInitials(patient.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-medium text-neutral-800">
                                {patient.fullName}
                              </h3>
                              <span className="text-sm text-neutral-600">
                                {patient.email}
                              </span>
                            </div>
                          </div>
                          <CheckCircle2 
                            className={`h-5 w-5 ${
                              selectedPatient === patient.id 
                                ? 'text-primary-600' 
                                : 'text-transparent'
                            }`} 
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div className="bg-white rounded-lg p-3 text-center">
                            <Pill className="h-5 w-5 text-primary-600 mx-auto mb-1" />
                            <p className="text-sm text-neutral-600">Medications</p>
                            <p className="font-bold">
                              {stats.medicationsTaken} of {stats.medicationsTotal}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <CheckSquare className="h-5 w-5 text-neutral-700 mx-auto mb-1" />
                            <p className="text-sm text-neutral-600">Tasks</p>
                            <p className="font-bold">
                              {stats.tasksCompleted} of {stats.tasksTotal}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <Users className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
                  <p>You don't have any assigned patients yet</p>
                  <p className="text-sm">Check back later or contact admin for assignments</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Details */}
          {selectedPatient && (
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="upcoming">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-neutral-800">
                      Patient Dashboard
                    </h2>
                    <TabsList>
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      <TabsTrigger value="medications">Medications</TabsTrigger>
                      <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="upcoming">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-neutral-700">Upcoming Items</h3>
                      
                      {upcomingItems.length > 0 ? (
                        <div className="divide-y">
                          {upcomingItems.map((item: any) => (
                            <div key={`${item.type}-${item.id}`} className="py-3 flex justify-between items-center">
                              <div className="flex items-center">
                                {item.type === "medication" ? (
                                  <div className="bg-primary-100 p-2 rounded-full mr-3">
                                    <Pill className="h-5 w-5 text-primary-600" />
                                  </div>
                                ) : (
                                  <div className="bg-neutral-100 p-2 rounded-full mr-3">
                                    <CheckSquare className="h-5 w-5 text-neutral-700" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-medium">{item.name || item.title}</h4>
                                  <p className="text-sm text-neutral-600">
                                    {item.type === "medication" ? item.dosage : item.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 text-warning mr-1" />
                                <span className="font-medium text-warning">{item.dueTime}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-neutral-500">
                          <p>No upcoming items for this patient</p>
                        </div>
                      )}
                      
                      <div className="pt-4 flex gap-4 justify-end">
                        <Link href={`/caretaker/medications?patientId=${selectedPatient}`}>
                          <Button variant="outline">Manage Medications</Button>
                        </Link>
                        <Link href={`/caretaker/tasks?patientId=${selectedPatient}`}>
                          <Button variant="outline">Manage Tasks</Button>
                        </Link>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="medications">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-neutral-700">Patient Medications</h3>
                      
                      {medications.length > 0 ? (
                        <div className="divide-y">
                          {medications.map((medication: any) => (
                            <div key={medication.id} className="py-3 flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="bg-primary-100 p-2 rounded-full mr-3">
                                  <Pill className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{medication.name}</h4>
                                  <p className="text-sm text-neutral-600">{medication.dosage}</p>
                                </div>
                              </div>
                              {medication.takenToday ? (
                                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">
                                  Taken today
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-100">
                                  {medication.nextDose || "Pending"}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-neutral-500">
                          <p>No medications for this patient</p>
                        </div>
                      )}
                      
                      <div className="pt-4 flex justify-end">
                        <Link href={`/caretaker/medications?patientId=${selectedPatient}`}>
                          <Button>Manage Medications</Button>
                        </Link>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tasks">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-neutral-700">Patient Tasks</h3>
                      
                      {tasks.length > 0 ? (
                        <div className="divide-y">
                          {tasks.map((task: any) => (
                            <div key={task.id} className="py-3 flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="bg-neutral-100 p-2 rounded-full mr-3">
                                  <CheckSquare className="h-5 w-5 text-neutral-700" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{task.title}</h4>
                                  <p className="text-sm text-neutral-600">{task.description}</p>
                                </div>
                              </div>
                              {task.isCompleted ? (
                                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">
                                  Completed
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-100">
                                  {format(new Date(task.dueDate), "h:mm a")}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-neutral-500">
                          <p>No tasks for this patient</p>
                        </div>
                      )}
                      
                      <div className="pt-4 flex justify-end">
                        <Link href={`/caretaker/tasks?patientId=${selectedPatient}`}>
                          <Button>Manage Tasks</Button>
                        </Link>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          {/* Recent Notifications */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-neutral-800">Recent Updates</h2>
                <Badge variant="secondary" className="rounded-full">
                  {notifications.filter((n: any) => !n.isRead).length} New
                </Badge>
              </div>
              
              {recentNotifications.length > 0 ? (
                <div className="space-y-4">
                  {recentNotifications.map((notification: any) => (
                    <div 
                      key={notification.id}
                      className={`p-3 rounded-lg border ${notification.isRead ? 'bg-white border-neutral-200' : 'bg-primary-50 border-primary-100'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-neutral-600">{notification.message}</p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-2 text-center">
                    <Link href="/notifications">
                      <Button variant="link">View all notifications</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <BellRing className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                  <p>No notifications yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Schedule Summary */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-neutral-800 mb-4">Today's Schedule</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Morning</h3>
                  <span className="text-sm text-neutral-500">8:00 AM - 12:00 PM</span>
                </div>
                
                <div className="text-sm space-y-2 pl-4 border-l-2 border-primary-100">
                  <div className="relative">
                    <div className="absolute -left-[17px] top-1 w-3 h-3 rounded-full bg-primary-500"></div>
                    <p className="font-medium">Patient Check-in: John Doe</p>
                    <p className="text-neutral-500">8:30 AM - 9:00 AM</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[17px] top-1 w-3 h-3 rounded-full bg-primary-500"></div>
                    <p className="font-medium">Medication Administration</p>
                    <p className="text-neutral-500">9:30 AM - 10:00 AM</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Afternoon</h3>
                  <span className="text-sm text-neutral-500">12:00 PM - 5:00 PM</span>
                </div>
                
                <div className="text-sm space-y-2 pl-4 border-l-2 border-primary-100">
                  <div className="relative">
                    <div className="absolute -left-[17px] top-1 w-3 h-3 rounded-full bg-primary-500"></div>
                    <p className="font-medium">Physical Therapy Assistance</p>
                    <p className="text-neutral-500">2:00 PM - 3:00 PM</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Evening</h3>
                  <span className="text-sm text-neutral-500">5:00 PM - 9:00 PM</span>
                </div>
                
                <div className="text-sm space-y-2 pl-4 border-l-2 border-primary-100">
                  <div className="relative">
                    <div className="absolute -left-[17px] top-1 w-3 h-3 rounded-full bg-primary-500"></div>
                    <p className="font-medium">Dinner Preparation</p>
                    <p className="text-neutral-500">6:00 PM - 6:30 PM</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[17px] top-1 w-3 h-3 rounded-full bg-primary-500"></div>
                    <p className="font-medium">Evening Medication</p>
                    <p className="text-neutral-500">8:00 PM - 8:30 PM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper functions for notification styling
function getNotificationTypeColor(type: string) {
  switch (type) {
    case "medication":
      return "bg-blue-100";
    case "task":
      return "bg-green-100";
    case "assignment":
      return "bg-purple-100";
    default:
      return "bg-neutral-100";
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "medication":
      return <Pill className="h-4 w-4 text-blue-600" />;
    case "task":
      return <CheckSquare className="h-4 w-4 text-green-600" />;
    case "assignment":
      return <Users className="h-4 w-4 text-purple-600" />;
    default:
      return <BellRing className="h-4 w-4 text-neutral-600" />;
  }
}
