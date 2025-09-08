// src/pages/MentorPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import Loader from "@/components/Loader";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "@/config/env";

import {
  MapPin,
  Briefcase,
  GraduationCap,
  DollarSign,
  User,
} from "lucide-react";

type Mentor = {
  mentor_id: number;
  first_name: string;
  last_name: string;
  address: string;
  email: string;
  title: string; // "Mr." | "Mrs." | "Miss." | "Ven." ...
  session_fee: number;
  profession: string;
  subject: string; // bio / description
  phone_number: string;
  qualification: string;
  mentor_image?: string;
};

export default function MentorPage() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    let active = true;
    async function fetchMentor() {
      try {
        const token = await getToken({ template: "skillmentor-auth-frontend" });
        const res = await fetch(`${BACKEND_URL}/academic/mentor/${mentorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
        if (!res.ok) throw new Error("Failed to load mentor");
        const data: Mentor = await res.json();
        if (active) setMentor(data);
      } catch (e: any) {
        if (active) setErr(e?.message || "Error loading mentor");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (mentorId) fetchMentor();
    return () => {
      active = false;
    };
  }, [mentorId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (err || !mentor) {
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold mb-2">Mentor</h1>
          <p className="text-red-600 text-sm">
            {err || "Mentor not found."}
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="text-sm underline underline-offset-4 text-blue-600"
            >
              Go back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${mentor.title ? mentor.title + " " : ""}${mentor.first_name} ${mentor.last_name}`;

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {fullName}
          </h1>
          <Link
            to="/"
            className="text-sm text-blue-600 hover:underline underline-offset-4"
          >
            Back
          </Link>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: profile card */}
          <aside className="lg:col-span-4">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gray-100 shadow">
                  {mentor.mentor_image ? (
                    <img
                      src={mentor.mentor_image}
                      alt={fullName}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-gray-400">
                      <User />
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-1">
                  <div className="text-xl font-semibold">{fullName}</div>
                  {mentor.profession && (
                    <div className="text-gray-600 flex items-center justify-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4" />
                      <span>{mentor.profession}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick facts */}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <div className="font-medium">Session Fee</div>
                    <div className="text-gray-600">LKR {mentor.session_fee}</div>
                  </div>
                </div>

                {mentor.qualification && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div>
                      <div className="font-medium">Qualification</div>
                      <div className="text-gray-600">{mentor.qualification}</div>
                    </div>
                  </div>
                )}

                {mentor.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div>
                      <div className="font-medium">Location</div>
                      <div className="text-gray-600">{mentor.address}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right: details */}
          <main className="lg:col-span-8">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-gray-700 leading-7">
                {mentor.subject || "No bio available."}
              </p>
            </div>

            {/* Actions / CTA (optional) */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`tel:${mentor.phone_number}`}
                className="rounded-xl border bg-black text-white px-5 py-3 text-center hover:opacity-90"
              >
                Contact via Phone
              </a>
              <a
                href={`mailto:${mentor.email}`}
                className="rounded-xl border px-5 py-3 text-center hover:bg-gray-50"
              >
                Contact via Email
              </a>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
