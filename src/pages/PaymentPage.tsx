import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router";
import Loader from "@/components/Loader";
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
import { MentorClass, Session, Student } from "@/lib/types";
import { BACKEND_URL } from "@/config/env";
import { useAuth, useUser } from "@clerk/clerk-react";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sessionId } = useParams();
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

  type Toast = { id: number; type: "success" | "error"; msg: string };
const [toasts, setToasts] = useState<Toast[]>([]);

function pushToast(type: Toast["type"], msg: string) {
  const id = Date.now() + Math.random();
  setToasts((t) => [...t, { id, type, msg }]);
  setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
}

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
        pushToast("error", "Failed to fetch student data. Please try again later.");
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
        pushToast("error", "Failed to fetch mentor class data. Please try again later.");
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

      // show success toast, then wait, then navigate
      pushToast("success", "Payment confirmed. Session scheduled successfully.");
      await delay(3000); // let user see the toast
      navigate("/dashboard");
      
    } catch (error) {
      pushToast("error", "There was a problem scheduling your session. Please try again.");
      setIsUploading(false);
    }
  };

  if (!student || !mentorClass) {
  return (
    <div className="container py-16 flex items-center justify-center">
      <Loader />
    </div>
  );
}

  return (
    <div className="container max-w-md py-10">
      {/* Toasts */}
      <div className="fixed right-4 top-20 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "rounded-lg px-3 py-2 text-sm shadow " +
              (t.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white")
            }
            role="status"
            aria-live="polite"
          >
            {t.msg}
          </div>
        ))}
      </div>
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
