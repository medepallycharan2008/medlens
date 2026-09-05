export type UserRole = 'patient' | 'doctor' | null;

export interface PatientUser {
  id: string; // matches patient.id
  patientId: string; // e.g. "ML-2026-1001"
  name: string;
  phone: string;
  email: string;
}

export interface DoctorUser {
  id: string;
  doctorId: string;
  name: string;
  email: string;
  department: string;
  hospital: string;
  qualification: string;
}

export interface AuthSession {
  role: UserRole;
  patientUser?: PatientUser;
  doctorUser?: DoctorUser;
}
