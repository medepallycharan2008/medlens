export type SourceType = 'USER_PROVIDED' | 'REPORT_EXTRACTED' | 'AI_GENERATED';

export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life-threatening';

export type ReportStatus = 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'NEEDS_REVIEW' | 'FAILED';

export type TimelineEventType = 'REGISTRATION' | 'UPDATE' | 'REPORT_UPLOAD' | 'CLINICAL_NOTE' | 'REPORT_EXTRACTED' | 'HUMAN_VERIFICATION' | 'PATIENT_CONFIRMED' | 'DOCTOR_VERIFIED' | 'AI_SUMMARY_GENERATED';

export type LabResultStatus = 'LOW' | 'NORMAL' | 'HIGH' | 'NOT_DETERMINABLE';

export type VerificationStatus = 'UNVERIFIED' | 'PATIENT_CONFIRMED' | 'DOCTOR_VERIFIED' | 'CONFIRMED' | 'EDITED' | 'REJECTED';

export type ConfidenceLevel = 'HIGH' | 'LOW';

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface Symptom {
  id: string;
  symptom: string;
  duration: string;
  notes: string;
  sourceType: SourceType;
}

export interface MedicalCondition {
  id: string;
  condition: string;
  diagnosedDate?: string;
  notes: string;
  sourceType: SourceType;
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: AllergySeverity;
  sourceType: SourceType;
}

export interface Medication {
  id: string;
  name: string;
  frequency: string;
  duration: string;
  notes: string;
  sourceType: SourceType;
}

export interface ExtractedLabResult {
  id: string;
  patientId: string;
  sourceReportId: string;
  sourceReportName: string;
  testName: string;
  value: string; // Exact raw string preserved from report
  numericValue?: number;
  unit: string;
  referenceRange: string | null; // From source report only!
  status: LabResultStatus; // LOW, NORMAL, HIGH, NOT_DETERMINABLE
  statusReason?: string;
  confidence: number; // 0.0 to 1.0
  confidenceLevel: ConfidenceLevel; // 'HIGH' | 'LOW' (Needs verification)
  sourceType: 'REPORT_EXTRACTED';
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  patientConfirmedAt?: string;
  doctorVerifiedBy?: string;
  doctorVerifiedAt?: string;
  originalExtraction?: {
    testName: string;
    value: string;
    unit: string;
    referenceRange: string | null;
  };
  reportDate: string;
}

export interface ExtractedReportData {
  reportId: string;
  laboratoryName?: string;
  reportDate?: string;
  observations?: string[];
  results: ExtractedLabResult[];
  extractedAt: string;
  rawText?: string;
}

export interface MedicalReport {
  reportId: string;
  patientId: string;
  reportName: string;
  reportType: string;
  uploadDate: string;
  reportDate: string;
  fileReference?: string;
  fileDataUrl?: string; // Stored image / simulated document preview data URL
  fileType?: string; // application/pdf, image/jpeg, image/png
  fileSize?: string;
  status: ReportStatus;
  notes?: string;
  sourceType: SourceType;
  extractedData?: ExtractedReportData;
  extractionError?: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  type: TimelineEventType;
  timestamp: string;
  title: string;
  description: string;
  sourceType: SourceType;
  referenceId?: string;
}

export interface PatientSummaryFinding {
  testName: string;
  value: string;
  unit: string;
  status: LabResultStatus;
  referenceRange: string | null;
  reportDate: string;
  sourceReportName: string;
}

export interface PatientSummary {
  id: string;
  patientId: string;
  generatedAt: string;
  sourceType: 'AI_GENERATED';
  summaryText: string;
  notableFindings: PatientSummaryFinding[];
  missingInformation: string[];
  reportCount: number;
}

export interface Patient {
  id: string; // internal UUID
  patientId: string; // e.g. "ML-2026-1001"
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  emergencyContact: EmergencyContact;

  // Clinical Information
  chiefComplaint: string;
  symptoms: Symptom[];
  conditions: MedicalCondition[];
  previousHistory: string;
  allergies: Allergy[];
  medications: Medication[];
  previousSurgeries: string;
  familyHistory: string;
  lifestyleInfo: string;

  // Reports and timeline
  reports: MedicalReport[];
  labResults: ExtractedLabResult[];
  aiSummary?: PatientSummary;
  timeline: TimelineEvent[];

  createdAt: string;
  updatedAt: string;
}

export interface PatientFilters {
  searchQuery: string;
  sex?: string;
  hasReports?: boolean;
  sortBy?: 'recent_updated' | 'recent_created' | 'name_asc' | 'age_asc';
}

export interface LabResultFilters {
  searchQuery: string;
  status?: LabResultStatus | 'ALL';
  verificationStatus?: VerificationStatus | 'ALL';
  reportId?: string | 'ALL';
}
