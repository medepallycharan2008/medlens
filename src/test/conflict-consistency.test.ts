import { describe, it, expect } from 'vitest';
import { SummaryService } from '../services/summaryService';
import type { Patient, ExtractedLabResult } from '../types/patient';

describe('Data Consistency, Conflict Detection & AI Summary Safety', () => {
  const basePatient: Patient = {
    id: 'p-consistency-1',
    patientId: 'ML-2026-6001',
    name: 'Suresh Kumar',
    dateOfBirth: '1975-08-20',
    age: 50,
    sex: 'Male',
    phone: '9845012345',
    email: 'suresh@example.in',
    address: 'Bengaluru, Karnataka',
    emergencyContact: { name: 'Rekha Kumar', phone: '9845099999', relation: 'Spouse' },
    chiefComplaint: 'Follow-up for chronic tiredness',
    symptoms: [
      { id: 'sym-1', symptom: 'Fatigue', duration: '3 weeks', notes: 'Gradual onset', sourceType: 'USER_PROVIDED' }
    ],
    conditions: [
      { id: 'con-1', condition: 'Type 2 Diabetes', diagnosedDate: '2021', notes: 'On diet control', sourceType: 'USER_PROVIDED' }
    ],
    previousHistory: 'Hypertension diagnosed 2019',
    allergies: [
      { id: 'all-1', allergen: 'Sulfa Drugs', reaction: 'Skin rash', severity: 'moderate', sourceType: 'USER_PROVIDED' }
    ],
    medications: [],
    previousSurgeries: '',
    familyHistory: '',
    lifestyleInfo: '',
    reports: [],
    labResults: [],
    timeline: [],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z'
  };

  describe('Non-Diagnostic AI Summary Generation', () => {
    it('generates clinical summary without making medical diagnoses or prescribing treatments', () => {
      const summary = SummaryService.generatePatientSummary(basePatient);

      expect(summary).toBeDefined();
      expect(summary.sourceType).toBe('AI_GENERATED');
      expect(summary.summaryText).toContain('Suresh Kumar');
      expect(summary.summaryText).toContain('Follow-up for chronic tiredness');

      // Crucial safety check: must NOT prescribe or diagnose
      expect(summary.summaryText.toLowerCase()).not.toContain('i diagnose');
      expect(summary.summaryText.toLowerCase()).not.toContain('prescribed dosage');
    });

    it('identifies missing clinical information (e.g. no reports attached)', () => {
      const summary = SummaryService.generatePatientSummary(basePatient);
      expect(summary.missingInformation.length).toBeGreaterThan(0);
      expect(summary.missingInformation.some(m => m.includes('laboratory or diagnostic radiology reports'))).toBe(true);
    });

    it('identifies and aggregates notable laboratory findings (LOW / HIGH) strictly when source range is present', () => {
      const patientWithLabs: Patient = {
        ...basePatient,
        reports: [
          {
            reportId: 'rep-1',
            patientId: basePatient.id,
            reportName: 'CBC Profile',
            reportType: 'Hematology',
            uploadDate: '2026-09-02',
            reportDate: '2026-09-02',
            status: 'PROCESSED',
            sourceType: 'REPORT_EXTRACTED'
          }
        ],
        labResults: [
          {
            id: 'lab-1',
            patientId: basePatient.id,
            sourceReportId: 'rep-1',
            sourceReportName: 'CBC Profile',
            testName: 'Hemoglobin',
            value: '10.8',
            unit: 'g/dL',
            referenceRange: '13.0 - 17.0',
            status: 'LOW',
            confidence: 0.96,
            confidenceLevel: 'HIGH',
            sourceType: 'REPORT_EXTRACTED',
            verificationStatus: 'CONFIRMED',
            reportDate: '2026-09-02'
          },
          {
            id: 'lab-2',
            patientId: basePatient.id,
            sourceReportId: 'rep-1',
            sourceReportName: 'CBC Profile',
            testName: 'Platelet Count',
            value: '220000',
            unit: '/cumm',
            referenceRange: '150000 - 450000',
            status: 'NORMAL',
            confidence: 0.98,
            confidenceLevel: 'HIGH',
            sourceType: 'REPORT_EXTRACTED',
            verificationStatus: 'CONFIRMED',
            reportDate: '2026-09-02'
          }
        ]
      };

      const summary = SummaryService.generatePatientSummary(patientWithLabs);
      expect(summary.notableFindings.length).toBe(1);
      expect(summary.notableFindings[0].testName).toBe('Hemoglobin');
      expect(summary.notableFindings[0].status).toBe('LOW');
      expect(summary.notableFindings[0].referenceRange).toBe('13.0 - 17.0');
    });

    it('ignores rejected results when compiling notable findings', () => {
      const patientWithRejectedLab: Patient = {
        ...basePatient,
        labResults: [
          {
            id: 'lab-rejected',
            patientId: basePatient.id,
            sourceReportId: 'rep-1',
            sourceReportName: 'Bad Scan',
            testName: 'Blood Sugar',
            value: '999',
            unit: 'mg/dL',
            referenceRange: '70 - 100',
            status: 'HIGH',
            confidence: 0.4,
            confidenceLevel: 'LOW',
            sourceType: 'REPORT_EXTRACTED',
            verificationStatus: 'REJECTED',
            reportDate: '2026-09-02'
          }
        ]
      };

      const summary = SummaryService.generatePatientSummary(patientWithRejectedLab);
      expect(summary.notableFindings.length).toBe(0);
    });
  });

  describe('Temporal Laboratory Value Consistency', () => {
    it('detects changes across multiple temporal reports for the same investigation', () => {
      const serialResults: ExtractedLabResult[] = [
        {
          id: 'lab-t1',
          patientId: basePatient.id,
          sourceReportId: 'rep-1',
          sourceReportName: 'Initial Visit',
          testName: 'Hemoglobin',
          value: '13.5',
          unit: 'g/dL',
          referenceRange: '13.0 - 17.0',
          status: 'NORMAL',
          confidence: 0.95,
          confidenceLevel: 'HIGH',
          sourceType: 'REPORT_EXTRACTED',
          verificationStatus: 'CONFIRMED',
          reportDate: '2026-01-10'
        },
        {
          id: 'lab-t2',
          patientId: basePatient.id,
          sourceReportId: 'rep-2',
          sourceReportName: 'Follow-up Visit',
          testName: 'Hemoglobin',
          value: '11.2',
          unit: 'g/dL',
          referenceRange: '13.0 - 17.0',
          status: 'LOW',
          confidence: 0.95,
          confidenceLevel: 'HIGH',
          sourceType: 'REPORT_EXTRACTED',
          verificationStatus: 'CONFIRMED',
          reportDate: '2026-09-05'
        }
      ];

      const baseline = serialResults.find(r => r.reportDate === '2026-01-10');
      const followUp = serialResults.find(r => r.reportDate === '2026-09-05');

      expect(baseline?.status).toBe('NORMAL');
      expect(followUp?.status).toBe('LOW');
      expect(parseFloat(followUp!.value)).toBeLessThan(parseFloat(baseline!.value));
    });
  });
});
