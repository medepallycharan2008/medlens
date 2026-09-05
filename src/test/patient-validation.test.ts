import { describe, it, expect, beforeEach } from 'vitest';
import { PatientStorageService } from '../services/storage';

describe('PatientStorageService - Core Data Validation & Storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('Initialization and Seed Data', () => {
    it('initializes with seed patients when localStorage is empty', () => {
      const patients = PatientStorageService.getAll();
      expect(patients.length).toBeGreaterThan(0);
      expect(patients[0]).toHaveProperty('patientId');
      expect(patients[0]).toHaveProperty('name');
      expect(patients[0]).toHaveProperty('labResults');
    });

    it('recovers gracefully from corrupted JSON in localStorage', () => {
      window.localStorage.setItem('medlens_patients_v1', 'INVALID_JSON_CORRUPTED');
      const patients = PatientStorageService.getAll();
      expect(Array.isArray(patients)).toBe(true);
      expect(patients.length).toBeGreaterThan(0);
    });

    it('ensures array defaults (labResults, reports, timeline) on loaded records', () => {
      window.localStorage.setItem(
        'medlens_patients_v1',
        JSON.stringify([
          {
            id: 'test-p1',
            patientId: 'ML-2026-9999',
            name: 'Test Incomplete'
          }
        ])
      );

      const patient = PatientStorageService.getById('test-p1');
      expect(patient).toBeDefined();
      expect(Array.isArray(patient?.labResults)).toBe(true);
      expect(Array.isArray(patient?.reports)).toBe(true);
      expect(Array.isArray(patient?.timeline)).toBe(true);
    });
  });

  describe('Patient ID Generation and Validation', () => {
    it('generates sequential patient IDs with ML-YYYY- prefix', () => {
      const nextId = PatientStorageService.generateNextPatientId();
      const year = new Date().getFullYear();
      expect(nextId).toMatch(new RegExp(`^ML-${year}-\\d{4}$`));
    });

    it('correctly detects duplicate and unique patient IDs', () => {
      const existingPatients = PatientStorageService.getAll();
      const existingId = existingPatients[0].patientId;

      expect(PatientStorageService.isPatientIdUnique(existingId)).toBe(false);
      expect(PatientStorageService.isPatientIdUnique(existingId, existingPatients[0].id)).toBe(true);
      expect(PatientStorageService.isPatientIdUnique('ML-2099-9999')).toBe(true);
    });
  });

  describe('Patient CRUD and Validation', () => {
    it('creates a new patient record with automatic registration timeline event', () => {
      const created = PatientStorageService.create({
        patientId: 'ML-2026-8001',
        name: 'Sunita Rao',
        dateOfBirth: '1988-04-12',
        age: 38,
        sex: 'Female',
        phone: '9845012345',
        email: 'sunita@example.in',
        address: 'Indiranagar, Bengaluru',
        emergencyContact: { name: 'K. Rao', phone: '9845099999', relation: 'Spouse' },
        chiefComplaint: 'Mild intermittent dizziness',
        symptoms: [],
        conditions: [],
        previousHistory: 'None',
        allergies: [],
        medications: [],
        previousSurgeries: '',
        familyHistory: '',
        lifestyleInfo: '',
        reports: [],
        labResults: []
      });

      expect(created.id).toBeDefined();
      expect(created.name).toBe('Sunita Rao');
      expect(created.timeline.length).toBeGreaterThanOrEqual(1);
      expect(created.timeline[0].type).toBe('REGISTRATION');

      const retrieved = PatientStorageService.getById(created.id);
      expect(retrieved?.patientId).toBe('ML-2026-8001');
    });

    it('updates patient details and logs an update timeline event', () => {
      const created = PatientStorageService.create({
        patientId: 'ML-2026-8002',
        name: 'Vikram Joshi',
        dateOfBirth: '',
        age: 45,
        sex: 'Male',
        phone: '9820011223',
        email: '',
        address: '',
        emergencyContact: { name: '', phone: '', relation: '' },
        chiefComplaint: 'Chest tightness',
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

      const updated = PatientStorageService.update(
        created.id,
        {
          chiefComplaint: 'Chest tightness resolved after rest',
          age: 46
        },
        'Patient updated complaint'
      );

      expect(updated.chiefComplaint).toBe('Chest tightness resolved after rest');
      expect(updated.age).toBe(46);
      expect(updated.timeline[0].type).toBe('UPDATE');
      expect(updated.timeline[0].description).toBe('Patient updated complaint');
    });

    it('retrieves patient by either internal UUID or patientId case-insensitively', () => {
      const patients = PatientStorageService.getAll();
      const target = patients[0];

      const byUuid = PatientStorageService.getById(target.id);
      expect(byUuid?.id).toBe(target.id);

      const byPatientIdLower = PatientStorageService.getById(target.patientId.toLowerCase());
      expect(byPatientIdLower?.id).toBe(target.id);
    });

    it('deletes patient records correctly', () => {
      const created = PatientStorageService.create({
        patientId: 'ML-2026-8003',
        name: 'To Delete',
        dateOfBirth: '',
        age: 29,
        sex: 'Other',
        phone: '9988776655',
        email: '',
        address: '',
        emergencyContact: { name: '', phone: '', relation: '' },
        chiefComplaint: '',
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

      expect(PatientStorageService.getById(created.id)).toBeDefined();
      PatientStorageService.delete(created.id);
      expect(PatientStorageService.getById(created.id)).toBeUndefined();
    });
  });
});
