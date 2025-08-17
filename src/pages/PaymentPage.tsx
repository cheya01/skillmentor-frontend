import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/hooks/use-toast";
import { MentorClass, Session, Student } from "@/lib/types";
import { BACKEND_URL } from "@/config/env";
import { useAuth, useUser } from "@clerk/clerk-react";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sessionId } = useParams();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const date = searchParams.get("date");
  const mentorId = searchParams.get("mentorId");
  const classroomID = searchParams.get("classroomID");
  const topic = searchParams.get("topic");
  const { user } = useUser();
  const { getToken } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [mentorClass, setMentorClass] = useState<MentorClass | null>(null);

  // add delay between fetching student and class data
  function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    async function fetchData() {
      const token = await getToken({ template: "skillmentor-auth-frontend" });
      const result = await fetch(
        `${BACKEND_URL}/academic/student/${user?.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("result", result);
      if (!result.ok) {
        toast({
          title: "Error",
          description: "Failed to fetch student data. Please try again later.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      const studentData: Student = await result.json();
      setStudent(studentData);

      await delay(3000); // wait for 3 seconds
      const result2 = await fetch(
        `${BACKEND_URL}/academic/classroom/${classroomID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("result2", result2);
      if (!result2.ok) {
        toast({
          title: "Error",
          description:
            "Failed to fetch mentor class data. Please try again later.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }
      const mentorClassData: MentorClass = await result2.json();
      setMentorClass(mentorClassData);
    }

    if (user && user.id) {
      fetchData();
    }
  }, [user]);

  interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

  const handleFileChange = (e: FileChangeEvent): void => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (
      !classroomID ||
      !mentorId ||
      !topic ||
      !file ||
      !date ||
      !sessionId ||
      !student
    )
      return;

    setIsUploading(true);

    try {
      // Construct session data
      const newSession: Session = {
        student_id: student.student_id,
        class_room_id: parseInt(classroomID),
        mentor_id: parseInt(mentorId),
        start_time: date,
        end_time: new Date(
          new Date(date).getTime() + 60 * 60 * 1000
        ).toISOString(), // setting a default 1 hour session duration
        topic: topic,
      };

      const token = await getToken({ template: "skillmentor-auth-frontend" });


      const result = await fetch(`${BACKEND_URL}/academic/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSession),
      });

      if (!result.ok) {
        throw new Error("Failed to create session");
      }

      toast({
        title: "Payment Confirmed",
        description:
          "Your bank slip has been uploaded and verified. Session scheduled successfully.",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was a problem scheduling your session. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Upload Bank Transfer Slip</CardTitle>
        </CardHeader>
        <form onSubmit={handleUpload}>
          <CardContent className="space-y-4">
            {mentorId && (
              <div className="text-sm font-medium">
                Session with:{" "}
                {mentorClass?.mentor.first_name +
                  " " +
                  mentorClass?.mentor.last_name}
              </div>
            )}
            {date && (
              <div className="text-sm">
                <strong>Session Date:</strong> {date}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="slip">Bank Transfer Slip</Label>
              <Input
                id="slip"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Please upload a clear image of your bank transfer slip to confirm
              your payment.
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={!file || isUploading}
            >
              {isUploading ? "Verifying..." : "Confirm Payment"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
