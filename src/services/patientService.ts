import type { Patient, PatientFilters } from '../types/patient';
import { PatientStorageService } from './storage';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class PatientService {
  public static getAllPatients(): Patient[] {
    return PatientStorageService.getAll();
  }

  public static getPatientById(id: string): Patient | undefined {
    return PatientStorageService.getById(id);
  }

  public static generatePatientId(): string {
    return PatientStorageService.generateNextPatientId();
  }

  public static calculateAgeFromDob(dob: string): number | null {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  }

  public static approximateDobFromAge(age: number): string {
    if (isNaN(age) || age < 0) return '';
    const currentYear = new Date().getFullYear();
    const approxYear = currentYear - age;
    return `${approxYear}-01-01`;
  }

  public static validatePatientForm(
    patient: Partial<Patient>,
    isEditing: boolean = false
  ): ValidationResult {
    const errors: Record<string, string> = {};

    // Name validation
    if (!patient.name || patient.name.trim().length === 0) {
      errors.name = 'Patient full name is required.';
    } else if (patient.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long.';
    }

    // Patient ID validation
    if (!patient.patientId || patient.patientId.trim().length === 0) {
      errors.patientId = 'Patient ID is required.';
    } else if (!PatientStorageService.isPatientIdUnique(patient.patientId, isEditing ? patient.id : undefined)) {
      errors.patientId = `Patient ID "${patient.patientId}" is already assigned to another patient.`;
    }

    // Sex validation
    if (!patient.sex) {
      errors.sex = 'Please select patient sex.';
    }

    // Age validation
    if (patient.age === undefined || patient.age === null || isNaN(Number(patient.age))) {
      errors.age = 'Patient age is required.';
    } else if (Number(patient.age) < 0 || Number(patient.age) > 125) {
      errors.age = 'Please enter a realistic age between 0 and 125.';
    }

    // Phone validation (Accepts standard 10-digit Indian numbers with optional country code)
    if (!patient.phone || patient.phone.trim().length === 0) {
      errors.phone = 'Contact phone number is required.';
    } else {
      const cleanPhone = patient.phone.replace(/[\s\-+()]/g, '');
      if (cleanPhone.length < 10) {
        errors.phone = 'Please enter a valid phone number (at least 10 digits).';
      }
    }

    // Email validation if entered
    if (patient.email && patient.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(patient.email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    // Date of Birth validation if entered
    if (patient.dateOfBirth) {
      const dobDate = new Date(patient.dateOfBirth);
      const today = new Date();
      if (isNaN(dobDate.getTime())) {
        errors.dateOfBirth = 'Invalid date of birth format.';
      } else if (dobDate > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  public static filterAndSortPatients(patients: Patient[], filters: PatientFilters): Patient[] {
    let result = [...patients];

    // Search query matches name, patientId, phone, or email
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.trim().toLowerCase();
      const cleanQ = q.replace(/[\s\-+()]/g, '');

      result = result.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const idMatch = p.patientId.toLowerCase().includes(q);
        const phoneMatch = p.phone.replace(/[\s\-+()]/g, '').includes(cleanQ);
        const emailMatch = p.email?.toLowerCase().includes(q);
        const complaintMatch = p.chiefComplaint?.toLowerCase().includes(q);
        return nameMatch || idMatch || phoneMatch || emailMatch || complaintMatch;
      });
    }

    // Filter by Sex
    if (filters.sex && filters.sex !== 'All') {
      result = result.filter(p => p.sex.toLowerCase() === filters.sex?.toLowerCase());
    }

    // Filter by reports
    if (filters.hasReports !== undefined) {
      if (filters.hasReports) {
        result = result.filter(p => p.reports && p.reports.length > 0);
      } else {
        result = result.filter(p => !p.reports || p.reports.length === 0);
      }
    }

    // Sort
    const sort = filters.sortBy || 'recent_updated';
    result.sort((a, b) => {
      switch (sort) {
        case 'recent_updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'recent_created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'age_asc':
          return a.age - b.age;
        default:
          return 0;
      }
    });

    return result;
  }

  public static getDashboardMetrics(patients: Patient[]) {
    const now = new Date().getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    const totalPatients = patients.length;
    const recentlyAdded = patients.filter(
      p => now - new Date(p.createdAt).getTime() <= sevenDaysMs
    ).length;
    const withReports = patients.filter(
      p => p.reports && p.reports.length > 0
    ).length;
    const recentlyUpdated = patients.filter(
      p => now - new Date(p.updatedAt).getTime() <= sevenDaysMs
    ).length;

    // Top recent patients
    const sortedByRecent = [...patients].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return {
      totalPatients,
      recentlyAdded,
      withReports,
      recentlyUpdated,
      recentPatients: sortedByRecent.slice(0, 5)
    };
  }
}
