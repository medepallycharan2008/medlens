import type { AuthSession, DoctorUser, PatientUser } from '../types/auth';
import { PatientStorageService } from './storage';

const AUTH_STORAGE_KEY = 'medlens_auth_session_v1';

export const DEFAULT_DOCTOR: DoctorUser = {
  id: 'doc-1',
  doctorId: 'DOC-2026-001',
  name: 'Dr. A. Deshmukh, MD',
  email: 'doctor@apollo.in',
  department: 'General Medicine & Outpatient Services',
  hospital: 'Apollo Health City, Bengaluru',
  qualification: 'MD (Internal Medicine), MBBS'
};

export class AuthService {
  public static getCurrentSession(): AuthSession {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return { role: null };
      return JSON.parse(raw);
    } catch {
      return { role: null };
    }
  }

  public static saveSession(session: AuthSession): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  public static logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  public static loginDoctor(identifier?: string, _password?: string): DoctorUser {
    const session: AuthSession = {
      role: 'doctor',
      doctorUser: {
        ...DEFAULT_DOCTOR,
        name: identifier && identifier.includes('@') ? DEFAULT_DOCTOR.name : DEFAULT_DOCTOR.name
      }
    };
    this.saveSession(session);
    return DEFAULT_DOCTOR;
  }

  public static loginPatient(identifier: string, _password?: string): PatientUser {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[\s\-+()]/g, '');

    const patients = PatientStorageService.getAll();
    const match = patients.find(p => {
      const pId = p.patientId.toLowerCase();
      const pEmail = p.email?.toLowerCase();
      const pPhone = p.phone.replace(/[\s\-+()]/g, '');
      const pName = p.name.toLowerCase();

      return pId === cleanId || pEmail === cleanId || pPhone.includes(cleanPhone) || pName === cleanId;
    });

    if (!match) {
      throw new Error(`Patient account not found for "${identifier}". Please check your Patient ID or phone number, or register a new account.`);
    }

    const patientUser: PatientUser = {
      id: match.id,
      patientId: match.patientId,
      name: match.name,
      phone: match.phone,
      email: match.email || ''
    };

    const session: AuthSession = {
      role: 'patient',
      patientUser
    };

    this.saveSession(session);
    return patientUser;
  }

  public static registerPatient(data: {
    name: string;
    phone: string;
    email?: string;
    age: number;
    sex: 'Male' | 'Female' | 'Other';
    address?: string;
    chiefComplaint?: string;
  }): PatientUser {
    const patientId = PatientStorageService.generateNextPatientId();

    const created = PatientStorageService.create({
      patientId,
      name: data.name.trim(),
      dateOfBirth: '',
      age: data.age,
      sex: data.sex,
      phone: data.phone.trim(),
      email: data.email?.trim() || '',
      address: data.address?.trim() || '',
      emergencyContact: { name: '', phone: '', relation: '' },
      chiefComplaint: data.chiefComplaint?.trim() || 'Patient self-registered via Patient Portal',
      symptoms: [],
      conditions: [],
      previousHistory: '',
      allergies: [],
      medications: [],
      previousSurgeries: '',
      familyHistory: '',
      lifestyleInfo: '',
      reports: [],
      labResults: []
    });

    const patientUser: PatientUser = {
      id: created.id,
      patientId: created.patientId,
      name: created.name,
      phone: created.phone,
      email: created.email || ''
    };

    const session: AuthSession = {
      role: 'patient',
      patientUser
    };

    this.saveSession(session);
    return patientUser;
  }
}
