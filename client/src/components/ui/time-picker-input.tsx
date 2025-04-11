import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface TimePickerInputProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function TimePickerInput({
  value,
  onChange,
  disabled = false,
}: TimePickerInputProps) {
  const [time, setTime] = useState(value || "");

  useEffect(() => {
    if (value !== undefined) {
      setTime(value);
    }
  }, [value]);

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = event.target.value;
    setTime(newTime);
    onChange?.(newTime);
  };

  return (
    <Input
      type="time"
      value={time}
      onChange={handleTimeChange}
      disabled={disabled}
    />
  );
}
