import { useState } from "react";
import { Calendar } from "./ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { useNavigate } from "react-router";
import type { MentorClass } from "@/lib/types";

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorClass: MentorClass;
}

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

export function SchedulingModal({
  isOpen,
  onClose,
  mentorClass,
}: SchedulingModalProps) {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const navigate = useNavigate();

  const handleSchedule = () => {
    if (date && selectedTime) {
      const sessionDateTime = new Date(date);
      const [hours, minutes] = selectedTime.split(":");
      sessionDateTime.setHours(
        Number.parseInt(hours),
        Number.parseInt(minutes)
      );

      const sessionId = `${mentorClass.class_room_id}-${Date.now()}`;
      const searchParams = new URLSearchParams({
        date: sessionDateTime.toISOString(),
        mentorId: mentorClass.mentor.mentor_id.toString(),
        classroomID: mentorClass.class_room_id.toString(),
        topic: mentorClass.title,
      });
      navigate(`/payment/${sessionId}?${searchParams.toString()}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-center space-y-0">
          <DialogTitle>Schedule this session</DialogTitle>
          <DialogDescription className="sr-only">
            Pick a date and time for your mentoring session with{" "}
            {mentorClass.mentor.first_name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Choose a date</h4>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          <div>
            <h4 className="font-medium mb-2">Choose a time</h4>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={!date || !selectedTime}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
