import { useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { BACKEND_URL } from "@/config/env";
import { useNavigate } from "react-router";


// Minimal types
type Classroom = {
  class_room_id: number;
  title: string;
  enrolled_student_count?: number;
  class_image?: string;
};

type Session = {
  session_id: number;
  topic?: string;
  start_time: string;
  end_time?: string;
  session_status: "PENDING" | "ACCEPTED" | "COMPLETED" | string;
  student?: { first_name: string; last_name: string } | null;
  mentor?: { first_name: string; last_name: string } | null;
  classroom?: { title: string } | null;
};

export default function AdminDB() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    if (isLoaded && user?.publicMetadata.role !== "admin") {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoaded, user, navigate]);

  if (!isLoaded || user?.publicMetadata.role !== "admin") return null;

  // Create Class
  const [newClass, setNewClass] = useState({
    title: "",
    enrolled_student_count: 0,
    class_image: "",
  });

  // Create Mentor
  const [mentor, setMentor] = useState({
    clerk_mentor_id: "",
    first_name: "",
    last_name: "",
    address: "",
    email: "",
    title: "",
    session_fee: 0,
    profession: "",
    subject: "",
    phone_number: "",
    qualification: "",
    mentor_image: "",
  });
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);

  // Manage Bookings
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const canSubmitClass = useMemo(() => newClass.title.trim().length > 0, [newClass]);
  const canSubmitMentor = useMemo(
    () =>
      mentor.first_name.trim() &&
      mentor.last_name.trim() &&
      mentor.email.trim() &&
      selectedClassIds.length > 0,
    [mentor, selectedClassIds]
  );

  // Data sources
  const [classes, setClasses] = useState<Classroom[]>([]);

  // Fetch all classes for dropdown
  async function loadClasses() {
    try {
      const token = await getToken({ template: "skillmentor-auth-frontend" });
      const res = await fetch(`${BACKEND_URL}/academic/classroom`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch {}
  }

  // Fetch sessions
  async function loadSessions() {
    setLoadingSessions(true);
    try {
      const token = await getToken({ template: "skillmentor-auth-frontend" });
      await delay(2000); // wait for 2 seconds
      const res = await fetch(`${BACKEND_URL}/academic/session`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch {}
    setLoadingSessions(false);
  }

  useEffect(() => {
    if (!isLoaded) return;
    loadClasses();
    loadSessions();
  }, [isLoaded]);

  // Handlers
  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitClass) return;
    try {
      const token = await getToken({ template: "skillmentor-auth-frontend" });
      console.log(newClass)
      const res = await fetch(`${BACKEND_URL}/academic/classroom`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newClass),
      });
      console.log(res);
      if (res.ok) {
        setNewClass({ title: "", enrolled_student_count: 0, class_image: "" });
        loadClasses();
      }
    } catch {}
  }

  async function handleCreateMentor(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitMentor) return;
    try {
      const token = await getToken({ template: "skillmentor-auth-frontend" });
      // If multiple classes are selected, create one mentor per class_room_id (simple approach)
      for (const id of selectedClassIds) {
        const payload = { ...mentor, class_room_id: id } as any;
        // Ensure numeric fee
        payload.session_fee = Number(payload.session_fee) || 0;
        const res = await fetch(`${BACKEND_URL}/academic/mentor`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          // stop on first error
          break;
        }
      }
      // reset
      setMentor({
        clerk_mentor_id: "",
        first_name: "",
        last_name: "",
        address: "",
        email: "",
        title: "",
        session_fee: 0,
        profession: "",
        subject: "",
        phone_number: "",
        qualification: "",
        mentor_image: "",
      });
      setSelectedClassIds([]);
    } catch {}
  }

  async function updateSessionStatus(sessionId: number, status: "ACCEPTED" | "COMPLETED") {
    try {
      const token = await getToken({ template: "skillmentor-auth-frontend" });
      const res = await fetch(
        `${BACKEND_URL}/academic/session/${sessionId}?sessionStatus=${status}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) loadSessions();
    } catch {}
  }

  // UI
  return (
    <div className="container mx-auto p-4 lg:p-8">
      <h1 className="text-2xl lg:text-3xl font-semibold mb-6">Admin Dashboard</h1>

      {/* 3 columns on lg+, stacked on small */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Class */}
        <section className="rounded-2xl border p-5 shadow-sm bg-white">
          <h2 className="text-xl font-medium mb-4">Create Class</h2>
          <form onSubmit={handleCreateClass} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={newClass.title}
                onChange={(e) => setNewClass((s) => ({ ...s, title: e.target.value }))}
                placeholder="AWS DevOps Engineering Professional Exam Prep"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Initial Enrolled Count</label>
              <input
                type="number"
                className="w-full rounded-lg border px-3 py-2"
                value={newClass.enrolled_student_count}
                onChange={(e) => setNewClass((s) => ({ ...s, enrolled_student_count: Number(e.target.value || 0) }))}
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Class Image URL</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={newClass.class_image}
                onChange={(e) => setNewClass((s) => ({ ...s, class_image: e.target.value }))}
                placeholder="https://.../image.webp"
              />
            </div>
            <button
              className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-50"
              type="submit"
              disabled={!canSubmitClass}
            >
              Create Class
            </button>
          </form>
        </section>

        {/* Create Mentor */}
        <section className="rounded-2xl border p-5 shadow-sm bg-white">
          <h2 className="text-xl font-medium mb-4">Create Mentor</h2>
          <form onSubmit={handleCreateMentor} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Clerk Mentor ID</label>
                <input className="w-full rounded-lg border px-3 py-2" value={mentor.clerk_mentor_id} onChange={(e) => setMentor((s) => ({ ...s, clerk_mentor_id: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Title</label>
                <input className="w-full rounded-lg border px-3 py-2" value={mentor.title} onChange={(e) => setMentor((s) => ({ ...s, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">First Name</label>
                <input className="w-full rounded-lg border px-3 py-2" value={mentor.first_name} onChange={(e) => setMentor((s) => ({ ...s, first_name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm mb-1">Last Name</label>
                <input className="w-full rounded-lg border px-3 py-2" value={mentor.last_name} onChange={(e) => setMentor((s) => ({ ...s, last_name: e.target.value }))} required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">Address</label>
                <input className="w-full rounded-lg border px-3 py-2" value={mentor.address} onChange={(e) => setMentor((s) => ({ ...s, address: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input type="email" className="w-full rounded-lg border px-3 py-2" value={mentor.email} onChange={(e) => setMentor((s) => ({ ...s, email: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm mb-1">Phone</label>
                <input className="w-full rounded-lg border px-3 py-2" value={mentor.phone_number} onChange={(e) => setMentor((s) => ({ ...s, phone_number: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Session Fee</label>
                <input type="number" className="w-full rounded-lg border px-3 py-2" value={mentor.session_fee} onChange={(e) => setMentor((s) => ({ ...s, session_fee: Number(e.target.value || 0) }))} min={0} />
              </div>
              <div>
                <label className="block text-sm mb-1">Profession</label>
                <input className="w-full rounded-lg border px-3 py-2" value={mentor.profession} onChange={(e) => setMentor((s) => ({ ...s, profession: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">Subject / Bio</label>
                <textarea className="w-full rounded-lg border px-3 py-2" rows={3} value={mentor.subject} onChange={(e) => setMentor((s) => ({ ...s, subject: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Qualification</label>
                <input className="w-full rounded-lg border px-3 py-2" value={mentor.qualification} onChange={(e) => setMentor((s) => ({ ...s, qualification: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Image URL</label>
                <input className="w-full rounded-lg border px-3 py-2" value={mentor.mentor_image} onChange={(e) => setMentor((s) => ({ ...s, mentor_image: e.target.value }))} placeholder="https://.../mentor.webp" />
              </div>
            </div>

            {/* Multi-select classes */}
            <div>
              <label className="block text-sm mb-1">Assign to Classes</label>
              <select
                multiple
                className="w-full rounded-lg border px-3 py-2 h-32"
                value={selectedClassIds.map(String)}
                onChange={(e) => {
                  const list = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                  setSelectedClassIds(list);
                }}
              >
                {classes.map((c) => (
                  <option key={c.class_room_id} value={c.class_room_id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Holds Ctrl/Cmd to select multiple.</p>
            </div>

            <button className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-50" type="submit" disabled={!canSubmitMentor}>
              Create Mentor
            </button>
          </form>
        </section>

        {/* Manage Bookings */}
        <section className="rounded-2xl border p-5 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Manage Bookings</h2>
            <button onClick={loadSessions} className="rounded-lg border px-3 py-1 text-sm">Refresh</button>
          </div>

          <div className="overflow-auto rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Class</Th>
                  <Th>Student</Th>
                  <Th>Mentor</Th>
                  <Th>Date</Th>
                  <Th>Duration</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {loadingSessions ? (
                  <tr><td className="p-3" colSpan={7}>Loading...</td></tr>
                ) : sessions.length === 0 ? (
                  <tr><td className="p-3" colSpan={7}>No sessions</td></tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.session_id} className="border-t">
                      <Td>{s.classroom?.title || '-'}</Td>
                      <Td>{s.student ? `${s.student.first_name} ${s.student.last_name}` : '-'}</Td>
                      <Td>{s.mentor ? `${s.mentor.first_name} ${s.mentor.last_name}` : '-'}</Td>
                      <Td>{new Date(s.start_time).toLocaleString()}</Td>
                      <Td>{durationText(s.start_time, s.end_time)}</Td>
                      <Td>
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                          {s.session_status}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex gap-2">
                          <button
                            className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50"
                            disabled={s.session_status !== "PENDING"}
                            onClick={() => updateSessionStatus(s.session_id, "ACCEPTED")}
                          >
                            Approve
                          </button>
                          <button
                            className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50"
                            disabled={s.session_status !== "ACCEPTED"}
                            onClick={() => updateSessionStatus(s.session_id, "COMPLETED")}
                          >
                            Complete
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-medium text-gray-600 p-3 whitespace-nowrap">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-3 align-top whitespace-nowrap">{children}</td>;
}

function durationText(start?: string, end?: string) {
  if (!start || !end) return "-";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return "-";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
