export interface MentorOld {
  id: string;
  courseTitle: string;
  description: string;
  mentorName: string;
  mentorImageUrl: string;
  mentorCompany: string;
  courseImageUrl: string;
  startYear: string;
  positiveReviews: number;
  enrollments: number;
  isCertified: boolean;
}

export interface Course {
  id: string;
  courseTitle: string;
  mentorName: string;
  mentorImageUrl: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  nextSession: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  sessions: any[];
  enrolledCourses: Course[];
}

export interface MentorClass {
  class_room_id: number;
  title: string;
  enrolled_student_count: number;
  class_image: string;
  mentor: {
    mentor_id: number;
    clerk_mentor_id: string;
    first_name: string;
    last_name: string;
    address: string;
    email: string;
    title: string;
    session_fee: number;
    profession: string;
    subject: string;
    phone_number: string;
    qualification: string;
    mentor_image: string;
  };
}

export interface Student {
  student_id: number;
  clerk_student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  age: number;
}

export interface Session {
  student_id: number;
  class_room_id: number;
  mentor_id: number;
  start_time: string;
  end_time: string;
  topic: string;
}

export interface ClassRoom {
  class_room_id: number;
  title: string;
  enrolled_student_count: number;
  class_image: string;
}

export interface Mentor {
  mentor_id: number;
  clerk_mentor_id: string;
  first_name: string;
  last_name: string;
  address: string;
  email: string;
  title: string;
  session_fee: number;
  profession: string;
  subject: string;
  phone_number: string;
  qualification: string;
  mentor_image: string;
}

export enum SessionStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  COMPLETED = "COMPLETED",
}

export interface FullSession {
  session_id: number;
  student: Student;
  class_room: ClassRoom;
  mentor: Mentor;
  topic: string;
  start_time: string;
  end_time: string;
  session_status: SessionStatus;
}
