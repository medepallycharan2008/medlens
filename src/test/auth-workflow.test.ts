import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService, DEFAULT_DOCTOR } from '../services/authService';
import { PatientStorageService } from '../services/storage';

describe('AuthService - Dual Role Authentication & Session Management', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('Session Initialization & Sign Out', () => {
    it('returns role: null when no user session is present in storage', () => {
      const session = AuthService.getCurrentSession();
      expect(session.role).toBeNull();
      expect(session.patientUser).toBeUndefined();
      expect(session.doctorUser).toBeUndefined();
    });

    it('clears active session completely upon logout', () => {
      AuthService.loginDoctor();
      expect(AuthService.getCurrentSession().role).toBe('doctor');

      AuthService.logout();
      expect(AuthService.getCurrentSession().role).toBeNull();
    });
  });

  describe('Doctor Clinical Login', () => {
    it('logs in doctor with default clinical credentials and persists session', () => {
      const doctorUser = AuthService.loginDoctor('doctor@apollo.in', 'password123');

      expect(doctorUser.name).toBe(DEFAULT_DOCTOR.name);
      expect(doctorUser.doctorId).toBe(DEFAULT_DOCTOR.doctorId);

      const session = AuthService.getCurrentSession();
      expect(session.role).toBe('doctor');
      expect(session.doctorUser?.doctorId).toBe(DEFAULT_DOCTOR.doctorId);
    });
  });

  describe('Patient Login Flow', () => {
    beforeEach(() => {
      // Ensure seed data exists
      PatientStorageService.getAll();
    });

    it('authenticates patient by Patient ID (e.g. ML-2026-1001)', () => {
      const patientUser = AuthService.loginPatient('ML-2026-1001');

      expect(patientUser.patientId).toBe('ML-2026-1001');
      expect(patientUser.name).toBe('Ramesh Sharma');

      const session = AuthService.getCurrentSession();
      expect(session.role).toBe('patient');
      expect(session.patientUser?.name).toBe('Ramesh Sharma');
    });

    it('authenticates patient by registered phone number', () => {
      // Ramesh Sharma phone in seed data is +91 98201 43210
      const patientUser = AuthService.loginPatient('9820143210');
      expect(patientUser.name).toBe('Ramesh Sharma');
    });

    it('throws error when patient identifier does not exist', () => {
      expect(() => {
        AuthService.loginPatient('NONEXISTENT_PATIENT_ID_9999');
      }).toThrowError(/Patient account not found/);
    });
  });

  describe('Patient Registration Flow', () => {
    it('registers new patient, generates patient ID, and persists active session', () => {
      const newPatient = AuthService.registerPatient({
        name: 'Gaurav Mehta',
        phone: '9876500112',
        email: 'gaurav@example.com',
        age: 35,
        sex: 'Male',
        chiefComplaint: 'Routine wellness check'
      });

      expect(newPatient.patientId).toMatch(/^ML-\d{4}-\d{4}$/);
      expect(newPatient.name).toBe('Gaurav Mehta');

      const session = AuthService.getCurrentSession();
      expect(session.role).toBe('patient');
      expect(session.patientUser?.patientId).toBe(newPatient.patientId);

      const stored = PatientStorageService.getById(newPatient.patientId);
      expect(stored).toBeDefined();
      expect(stored?.name).toBe('Gaurav Mehta');
    });
  });
});
