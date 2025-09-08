import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { CalendarDays } from "lucide-react";
import { StatusPill } from "@/components/StatusPill";
import Loader from "@/components/Loader";
import { FullSession } from "@/lib/types";
import { useNavigate } from "react-router";
import { BACKEND_URL } from "@/config/env";
import { Link } from "react-router";

export default function DashboardPage() {
const { isLoaded, isSignedIn } = useAuth();
const { user } = useUser();
const { getToken } = useAuth();
const router = useNavigate();

const [courses, setCourses] = useState<FullSession[]>([]);
const [loadingCourses, setLoadingCourses] = useState(true); // 👈

function delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

// fetch
useEffect(() => {
  async function fetchSessions() {
    if (!user) return;
    const token = await getToken({ template: "skillmentor-auth-frontend" });
    if (!token) return;

    try {
      setLoadingCourses(true);                    // 👈 start
      await delay(3000); // wait for 3 seconds
      const response = await fetch(
        `${BACKEND_URL}/academic/session/student/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch user sessions");
      const data: FullSession[] = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setCourses([]); // ensure defined
    } finally {
      setLoadingCourses(false);                   // 👈 done
    }
  }

  if (isLoaded && isSignedIn) fetchSessions();
}, [isLoaded, isSignedIn, user]);

// UI
if (!isLoaded) {
  return (
    <div className="container py-10">
      <div className="flex items-center justify-center">
        <Loader />
      </div>
    </div>
  );
}

if (!isSignedIn) {
  router("/login");
  return null;
}

  return (
  <div className="container py-10">
    <h1 className="text-3xl font-bold tracking-tight mb-6">My Courses</h1>

    {loadingCourses ? (
      // 1) show loader while fetching
      <div className="flex items-center justify-center py-12">
        <Loader />
      </div>
    ) : courses.length === 0 ? (
      // 2) empty state after fetch completes
      <p className="text-muted-foreground">No courses enrolled yet.</p>
    ) : (
      // 3) courses grid
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course.session_id}
            className="rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600"
          >
            <div className="absolute top-4 right-4">
              <StatusPill status={course.session_status} />
            </div>
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
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">{course.topic}</h2>
              <Link to={`/mentor/${course.mentor.mentor_id}`}>
                <p className="text-blue-100/80">
                  <span>Mentor: </span>
                  <span className="hover:underline">
                    {course.mentor.first_name + " " + course.mentor.last_name}
                  </span>
                </p>
              </Link>
              <div className="flex items-center text-blue-100/80 text-sm mt-2">
                <CalendarDays className="mr-2 h-4 w-4" />
                Next Session: {new Date(course.start_time).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

}
