import { describe, it, expect, beforeEach } from 'vitest';
import { VerificationService } from '../services/verificationService';
import { PatientStorageService } from '../services/storage';
import type { ExtractedLabResult } from '../types/patient';

describe('Clinical Verification Workflow & Audit Provenance', () => {
  const baseResult: ExtractedLabResult = {
    id: 'lab-test-1',
    patientId: 'p-1',
    sourceReportId: 'rep-1',
    sourceReportName: 'Metropolis Blood Test',
    testName: 'Fasting Blood Glucose',
    value: '135',
    unit: 'mg/dL',
    referenceRange: '70 - 100',
    status: 'HIGH',
    statusReason: 'Value exceeds threshold',
    confidence: 0.95,
    confidenceLevel: 'HIGH',
    sourceType: 'REPORT_EXTRACTED',
    verificationStatus: 'UNVERIFIED',
    originalExtraction: {
      testName: 'Fasting Blood Glucose',
      value: '135',
      unit: 'mg/dL',
      referenceRange: '70 - 100'
    },
    reportDate: '2026-09-05'
  };

  describe('Patient Confirmation Flow', () => {
    it('sets verificationStatus to PATIENT_CONFIRMED and stamps confirmation timestamp', () => {
      const confirmed = VerificationService.patientConfirmResult(baseResult);
      expect(confirmed.verificationStatus).toBe('PATIENT_CONFIRMED');
      expect(confirmed.patientConfirmedAt).toBeDefined();
      expect(new Date(confirmed.patientConfirmedAt!).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Doctor Verification Flow', () => {
    it('sets verificationStatus to DOCTOR_VERIFIED with attending doctor name and timestamp', () => {
      const doctorName = 'Dr. A. Deshmukh, MD';
      const verified = VerificationService.doctorVerifyResult(baseResult, doctorName);

      expect(verified.verificationStatus).toBe('DOCTOR_VERIFIED');
      expect(verified.doctorVerifiedBy).toBe(doctorName);
      expect(verified.doctorVerifiedAt).toBeDefined();
      expect(verified.verifiedBy).toBe(doctorName);
    });
  });

  describe('Staff Editing Flow and Audit Trail Preservation', () => {
    it('edits value, re-evaluates reference range, and sets EDITED status', () => {
      const edited = VerificationService.editResult({
        result: baseResult,
        newValue: '92',
        staffName: 'Dr. A. Deshmukh, MD'
      });

      expect(edited.verificationStatus).toBe('EDITED');
      expect(edited.value).toBe('92');
      // Status re-evaluated against '70 - 100' -> now NORMAL
      expect(edited.status).toBe('NORMAL');
      expect(edited.verifiedBy).toBe('Dr. A. Deshmukh, MD');
      expect(edited.verifiedAt).toBeDefined();
    });

    it('PRESERVES originalExtraction for audit trail when edited', () => {
      const edited = VerificationService.editResult({
        result: baseResult,
        newValue: '95',
        newUnit: 'mg/dL',
        newReferenceRange: '70 - 110',
        staffName: 'Clinical Biochemist'
      });

      expect(edited.value).toBe('95');
      expect(edited.referenceRange).toBe('70 - 110');

      // Original unedited extraction must remain untouched in originalExtraction
      expect(edited.originalExtraction).toBeDefined();
      expect(edited.originalExtraction?.value).toBe('135');
      expect(edited.originalExtraction?.testName).toBe('Fasting Blood Glucose');
      expect(edited.originalExtraction?.referenceRange).toBe('70 - 100');
    });
  });

  describe('Rejection Flow', () => {
    it('marks inaccurate or corrupted extraction as REJECTED', () => {
      const rejected = VerificationService.rejectResult(baseResult, 'Staff Nurse');
      expect(rejected.verificationStatus).toBe('REJECTED');
      expect(rejected.verifiedBy).toBe('Staff Nurse');
      expect(rejected.verifiedAt).toBeDefined();
    });
  });

  describe('Storage Verification Persistence and Timeline Event Logging', () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    it('persists verification state in patient record and logs a HUMAN_VERIFICATION timeline event', () => {
      const patient = PatientStorageService.create({
        patientId: 'ML-2026-7001',
        name: 'Anita Roy',
        dateOfBirth: '',
        age: 32,
        sex: 'Female',
        phone: '9845099887',
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
        labResults: [{ ...baseResult, id: 'lab-persisted-1', patientId: '' }]
      });

      const updatedItem = PatientStorageService.updateLabResultVerification(
        patient.id,
        'lab-persisted-1',
        'CONFIRMED'
      );

      expect(updatedItem.verificationStatus).toBe('CONFIRMED');

      const reloaded = PatientStorageService.getById(patient.id);
      expect(reloaded?.labResults[0].verificationStatus).toBe('CONFIRMED');

      // Timeline event
      const timelineVerification = reloaded?.timeline.find(t => t.type === 'HUMAN_VERIFICATION');
      expect(timelineVerification).toBeDefined();
      expect(timelineVerification?.title).toContain('Lab Result Confirmed');
    });
  });
});
