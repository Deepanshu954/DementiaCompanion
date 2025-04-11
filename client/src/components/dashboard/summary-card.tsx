import { Card, CardContent } from "@/components/ui/card";
import { Pill, CheckSquare, Bell } from "lucide-react";

interface SummaryCardProps {
  type: "medication" | "task" | "upcoming";
  completed: number;
  total: number;
}

export function SummaryCard({ type, completed, total }: SummaryCardProps) {
  const getIcon = () => {
    switch (type) {
      case "medication":
        return <Pill className="h-10 w-10 text-primary-600" />;
      case "task":
        return <CheckSquare className="h-10 w-10 text-neutral-700" />;
      case "upcoming":
        return <Bell className="h-10 w-10 text-secondary-500" />;
    }
  };
  
  const getTitle = () => {
    switch (type) {
      case "medication":
        return "Medications";
      case "task":
        return "Daily Tasks";
      case "upcoming":
        return "Upcoming";
    }
  };
  
  const getBackgroundColor = () => {
    switch (type) {
      case "medication":
        return "bg-primary-50";
      case "task":
        return "bg-neutral-100";
      case "upcoming":
        return "bg-secondary-500 bg-opacity-10";
    }
  };
  
  const getTextColor = () => {
    switch (type) {
      case "medication":
        return "text-primary-600";
      case "task":
        return "text-neutral-700";
      case "upcoming":
        return "text-secondary-500";
    }
  };
  
  return (
    <div className={`rounded-lg p-4 flex items-center ${getBackgroundColor()}`}>
      <span className="text-4xl mr-4">{getIcon()}</span>
      <div>
        <h3 className="text-lg font-medium text-neutral-800">{getTitle()}</h3>
        <p className={`text-2xl font-bold ${getTextColor()}`}>
          {type === "upcoming" ? (
            <>
              {total} <span className="text-base font-normal text-neutral-700">reminders</span>
            </>
          ) : (
            <>
              {completed} of {total} <span className="text-base font-normal text-neutral-700">
                {type === "medication" ? "taken" : "completed"}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
