export interface College {
  id: number;
  name: string;
  city: string;
  state: string;
  type: string;
  description: string;
  website: string;
  tuition_in_state: number;
  tuition_out_state: number;
  room_and_board: number;
  total_cost_in_state: number;
  total_cost_out_state: number;
  acceptance_rate: number;
  graduation_rate: number;
  enrollment: number;
  student_faculty_ratio: number;
  sat_math_25: number;
  sat_math_75: number;
  sat_reading_25: number;
  sat_reading_75: number;
  act_25: number;
  act_75: number;
  created_at: string;
  updated_at: string;
}

export interface FavoriteCollege {
  id: number;
  userId: number;
  collegeId: number;
  college: College;
  createdAt: string;
}

export interface SearchFilters {
  query?: string;
  type?: string;
  state?: string;
  minTuition?: number;
  maxTuition?: number;
  minAcceptanceRate?: number;
  maxAcceptanceRate?: number;
  minGraduationRate?: number;
  maxGraduationRate?: number;
  minEnrollment?: number;
  maxEnrollment?: number;
  minStudentFacultyRatio?: number;
  maxStudentFacultyRatio?: number;
  minSatMath?: number;
  maxSatMath?: number;
  minSatReading?: number;
  maxSatReading?: number;
  minAct?: number;
  maxAct?: number;
} 