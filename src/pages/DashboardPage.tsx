import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { CalendarDays } from "lucide-react";
import { StatusPill } from "@/components/StatusPill";
import { FullSession } from "@/lib/types";
import { useNavigate } from "react-router";
import { BACKEND_URL } from "@/config/env";

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [courses, setCourses] = useState<FullSession[]>([]);
  const router = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();

  function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    async function createOrFetchUser() {
      if (!user) return;

      const token = await getToken({ template: "skillmentor-auth-frontend" });
      if (!token) return;

      // Prepare a payload that matches with the  backend endpoint requirements
      const userPayload = {
        clerk_student_id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.primaryEmailAddress?.emailAddress,
        phone_number: "-",
        address: "-",
        age: 20,
      };

      try {
        // Perform API call to create/fetch user in backend
        const createdUser = await fetch(`${BACKEND_URL}/academic/student`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userPayload),
        });

        if (!createdUser.ok) {
          throw new Error("Failed to create/fetch user");
        }

        // Logging the details to the console
        const userData = await createdUser.json();
        console.log("User ID:", user.id);
        console.log("User Token:", token);
        console.log("User created/fetched successfully:", userData);
      } catch (error) {
        console.error("Error creating/fetching user:", error);
      }
    }

    if (isLoaded && isSignedIn) {
      createOrFetchUser();
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    async function fetchSessions() {
      if (!user) return;

      const token = await getToken({ template: "skillmentor-auth-frontend" });
      if (!token) return;

      try {
      await delay(3000); // wait for 2 seconds
        const response = await fetch(
          `${BACKEND_URL}/academic/session/student/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user sessions");
        }

        const data: FullSession[] = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    }

    if (isLoaded && isSignedIn) {
      fetchSessions();
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }
  if (!isSignedIn) {
    router("/login");
  }

  if (!courses.length) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-6">My Courses</h1>
        <p className="text-muted-foreground">No courses enrolled yet.</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">My Courses</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course.session_id}
            className="rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600"
          >
            {/* Status Pill */}
            <div className="absolute top-4 right-4">
              <StatusPill status={course.session_status} />
            </div>

            {/* Profile Image */}
            <div className="size-24 rounded-full bg-white/10 mb-4 relative">
              {course.mentor.mentor_image ? (
                <img
                  src={course.mentor.mentor_image}
                  alt={course.mentor.first_name}
                  className="w-full h-full object-cover object-top rounded-full"
                />
              ) : (
                <span className="text-2xl font-semibold">
                  {course.mentor.first_name.charAt(0)}
                </span>
              )}
            </div>

            {/* Course Info */}
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">
                {course.topic}
              </h2>
              <p className="text-blue-100/80">
                Mentor:{" "}
                {course.mentor.first_name + " " + course.mentor.last_name}
              </p>
              <div className="flex items-center text-blue-100/80 text-sm mt-2">
                <CalendarDays className="mr-2 h-4 w-4" />
                Next Session: {new Date(course.start_time).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
