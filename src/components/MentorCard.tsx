import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Calendar, GraduationCap } from "lucide-react";
import type { MentorClass } from "@/lib/types";
import { SchedulingModal } from "@/components/SchedulingModel";
import { SignupDialog } from "@/components/SignUpDialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";

export function MentorCard({ mentorClass }: { mentorClass: MentorClass }) {
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isSignedIn } = useAuth();

  // Use a simple threshold to decide if the bio is long enough
  const bioTooLong = mentorClass.mentor.subject.length > 200;

  const handleSchedule = () => {
    if (!isSignedIn) {
      setIsSignupDialogOpen(true);
      return;
    }
    setIsSchedulingModalOpen(true);
  };

  return (
    <>
      <Card className="flex flex-col h-full">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-xl">{mentorClass.title}</h3>
              {/* <div className="flex items-center space-x-2">
                <ThumbsUp className="size-6" />
                <p className="text-sm text-muted-foreground">
                  {mentorClass.enrolled_student_count} enrolled students
                </p>
              </div> */}
              <div className="flex items-center space-x-2">
                <img
                  src={mentorClass.mentor.mentor_image}
                  alt={mentorClass.mentor.first_name}
                  className="size-6 object-cover object-top rounded-full"
                />
                <span className="text-sm">
                  {mentorClass.mentor.first_name +
                    " " +
                    mentorClass.mentor.last_name}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Building2 className="size-6" />
                <span>{mentorClass.mentor.profession}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="size-6" />
                <span>{mentorClass.mentor.qualification}</span>
              </div>
            </div>
            <div className="w-36">
              <div className="size-20 bg-muted flex items-center justify-center">
                {mentorClass.class_image ? (
                  <img
                    src={mentorClass.class_image}
                    alt={mentorClass.title}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-2xl font-semibold">
                    {mentorClass.mentor.first_name.charAt(0)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4 flex-grow">
            <div>
              <p
                className={cn(
                  "text-sm transition-all duration-300 ease-in-out",
                  !isExpanded && bioTooLong ? "line-clamp-3" : ""
                )}
              >
                {mentorClass.mentor.subject}
              </p>
              {bioTooLong && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-primary text-sm font-medium mt-1 hover:underline"
                >
                  {isExpanded ? "See less" : "See more"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-auto">
            <h4 className="font-medium mb-2">Highlights</h4>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-md flex flex-col gap-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4" />
                <span className="text-sm">
                  {mentorClass.enrolled_student_count} Enrollments
                </span>
              </div>

              {/* {mentor.isCertified && (
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-sm">Certified Teacher</span>
                </div>
              )} */}
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <Button
            onClick={handleSchedule}
            className="w-full bg-black text-white hover:bg-black/90"
          >
            Schedule a session
          </Button>
        </div>
      </Card>

      <SignupDialog
        isOpen={isSignupDialogOpen}
        onClose={() => setIsSignupDialogOpen(false)}
      />

      <SchedulingModal
        isOpen={isSchedulingModalOpen}
        onClose={() => setIsSchedulingModalOpen(false)}
        mentorClass={mentorClass}
      />
    </>
  );
}
