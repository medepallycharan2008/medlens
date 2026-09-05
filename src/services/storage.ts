import type { Patient, MedicalReport, TimelineEvent, ExtractedReportData, ExtractedLabResult, PatientSummary, VerificationStatus } from '../types/patient';
import { INITIAL_PATIENTS } from './seedData';

const STORAGE_KEY = 'medlens_patients_v1';

export class PatientStorageService {
  private static getStoredData(): Patient[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Initialize with realistic seed data on first run
        this.setStoredData(INITIAL_PATIENTS);
        return INITIAL_PATIENTS;
      }
      const parsed: Patient[] = JSON.parse(raw);
      // Ensure labResults array exists on all patients
      return parsed.map(p => ({
        ...p,
        labResults: p.labResults || [],
        reports: p.reports || [],
        timeline: p.timeline || []
      }));
    } catch (err) {
      console.error('Failed to read from localStorage:', err);
      return INITIAL_PATIENTS;
    }
  }

  private static setStoredData(patients: Patient[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    } catch (err) {
      console.error('Failed to write to localStorage:', err);
      throw new Error('Local storage write failed. Your browser storage might be full.');
    }
  }

  public static getAll(): Patient[] {
    return this.getStoredData();
  }

  public static getById(idOrPatientId: string): Patient | undefined {
    const list = this.getStoredData();
    return list.find(p => p.id === idOrPatientId || p.patientId.toLowerCase() === idOrPatientId.toLowerCase());
  }

  public static generateNextPatientId(): string {
    const list = this.getStoredData();
    const currentYear = new Date().getFullYear();
    const prefix = `ML-${currentYear}-`;
    
    // Find highest existing numerical suffix
    let maxSuffix = 1000;
    for (const p of list) {
      if (p.patientId && p.patientId.startsWith(prefix)) {
        const numPart = parseInt(p.patientId.slice(prefix.length), 10);
        if (!isNaN(numPart) && numPart > maxSuffix) {
          maxSuffix = numPart;
        }
      }
    }
    return `${prefix}${maxSuffix + 1}`;
  }

  public static isPatientIdUnique(patientId: string, excludeId?: string): boolean {
    const list = this.getStoredData();
    const trimmed = patientId.trim().toUpperCase();
    return !list.some(p => p.patientId.toUpperCase() === trimmed && p.id !== excludeId);
  }

  public static create(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'labResults'> & { id?: string; timeline?: TimelineEvent[]; labResults?: ExtractedLabResult[] }): Patient {
    const list = this.getStoredData();
    const now = new Date().toISOString();
    const id = patientData.id || `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const registrationEvent: TimelineEvent = {
      id: `tl-${Date.now()}-reg`,
      patientId: id,
      type: 'REGISTRATION',
      timestamp: now,
      title: 'Patient Registered',
      description: `Patient intake recorded for ${patientData.name}. Initial clinical profile created.`,
      sourceType: 'USER_PROVIDED'
    };

    const initialTimeline = patientData.timeline && patientData.timeline.length > 0 
      ? patientData.timeline 
      : [registrationEvent];

    const newPatient: Patient = {
      ...patientData,
      id,
      createdAt: now,
      updatedAt: now,
      timeline: initialTimeline,
      reports: patientData.reports || [],
      labResults: patientData.labResults || []
    };

    list.unshift(newPatient);
    this.setStoredData(list);
    return newPatient;
  }

  public static update(id: string, updates: Partial<Patient>, updateDescription?: string): Patient {
    const list = this.getStoredData();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Patient with ID "${id}" not found.`);
    }

    const current = list[index];
    const now = new Date().toISOString();

    const timeline = [...(current.timeline || [])];
    if (updateDescription) {
      timeline.unshift({
        id: `tl-${Date.now()}-upd`,
        patientId: id,
        type: 'UPDATE',
        timestamp: now,
        title: 'Information Updated',
        description: updateDescription,
        sourceType: 'USER_PROVIDED'
      });
    }

    const updatedPatient: Patient = {
      ...current,
      ...updates,
      id: current.id, // Immutable
      createdAt: current.createdAt,
      updatedAt: now,
      timeline
    };

    list[index] = updatedPatient;
    this.setStoredData(list);
    return updatedPatient;
  }

  public static delete(id: string): void {
    const list = this.getStoredData();
    const filtered = list.filter(p => p.id !== id);
    this.setStoredData(filtered);
  }

  public static addReport(patientId: string, reportData: Omit<MedicalReport, 'reportId' | 'patientId' | 'sourceType'>): MedicalReport {
    const list = this.getStoredData();
    const index = list.findIndex(p => p.id === patientId);
    if (index === -1) {
      throw new Error(`Patient not found.`);
    }

    const now = new Date().toISOString();
    const reportId = `rep-${Date.now()}`;
    const newReport: MedicalReport = {
      ...reportData,
      reportId,
      patientId,
      sourceType: 'USER_PROVIDED'
    };

    const patient = list[index];
    const reports = [newReport, ...(patient.reports || [])];
    const timeline = [
      {
        id: `tl-${Date.now()}-rep`,
        patientId,
        type: 'REPORT_UPLOAD' as const,
        timestamp: now,
        title: `Report Uploaded: ${reportData.reportName}`,
        description: `Attached report "${reportData.reportName}" (${reportData.reportType || 'General Report'}) with status ${reportData.status}.`,
        sourceType: 'USER_PROVIDED' as const,
        referenceId: reportId
      },
      ...(patient.timeline || [])
    ];

    list[index] = {
      ...patient,
      reports,
      timeline,
      updatedAt: now
    };

    this.setStoredData(list);
    return newReport;
  }

  /**
   * Saves a newly processed report along with its extracted laboratory items and optical document preview.
   */
  public static addExtractedReport(
    patientId: string,
    reportData: Omit<MedicalReport, 'reportId' | 'patientId' | 'sourceType'>,
    extractedData: ExtractedReportData
  ): MedicalReport {
    const list = this.getStoredData();
    const index = list.findIndex(p => p.id === patientId);
    if (index === -1) {
      throw new Error(`Patient not found.`);
    }

    const now = new Date().toISOString();
    const reportId = extractedData.reportId || `rep-${Date.now()}`;

    const newReport: MedicalReport = {
      ...reportData,
      reportId,
      patientId,
      sourceType: 'REPORT_EXTRACTED',
      extractedData
    };

    const patient = list[index];
    const reports = [newReport, ...(patient.reports || [])];
    
    // Merge new extracted lab results with existing patient lab results
    const existingLabResults = patient.labResults || [];
    const updatedLabResults = [...extractedData.results, ...existingLabResults];

    const timelineEvents: TimelineEvent[] = [
      {
        id: `tl-${Date.now()}-ocr`,
        patientId,
        type: 'REPORT_EXTRACTED',
        timestamp: now,
        title: `Report Processed: ${reportData.reportName}`,
        description: `Extracted ${extractedData.results.length} structured laboratory parameters from ${extractedData.laboratoryName || 'Diagnostic Report'}. Evaluated against source reference ranges.`,
        sourceType: 'REPORT_EXTRACTED',
        referenceId: reportId
      },
      {
        id: `tl-${Date.now()}-upl`,
        patientId,
        type: 'REPORT_UPLOAD',
        timestamp: now,
        title: `Report Uploaded: ${reportData.reportName}`,
        description: `Uploaded source document (${reportData.fileSize || 'Standard file size'}).`,
        sourceType: 'USER_PROVIDED',
        referenceId: reportId
      },
      ...(patient.timeline || [])
    ];

    list[index] = {
      ...patient,
      reports,
      labResults: updatedLabResults,
      timeline: timelineEvents,
      updatedAt: now
    };

    this.setStoredData(list);
    return newReport;
  }

  /**
   * Updates human verification state (Confirmed / Edited / Rejected) on an extracted lab result.
   */
  public static updateLabResultVerification(
    patientId: string,
    resultId: string,
    status: VerificationStatus,
    updatedResult?: ExtractedLabResult
  ): ExtractedLabResult {
    const list = this.getStoredData();
    const index = list.findIndex(p => p.id === patientId);
    if (index === -1) {
      throw new Error(`Patient not found.`);
    }

    const patient = list[index];
    const labResults = [...(patient.labResults || [])];
    const itemIdx = labResults.findIndex(r => r.id === resultId);

    if (itemIdx === -1) {
      throw new Error(`Laboratory result not found.`);
    }

    const now = new Date().toISOString();
    const currentItem = labResults[itemIdx];

    const finalItem: ExtractedLabResult = updatedResult ? {
      ...updatedResult,
      verificationStatus: status,
      verifiedAt: now,
      verifiedBy: updatedResult.verifiedBy || 'Staff Nurse / Medical Officer'
    } : {
      ...currentItem,
      verificationStatus: status,
      verifiedAt: now,
      verifiedBy: 'Staff Nurse / Medical Officer'
    };

    labResults[itemIdx] = finalItem;

    const timelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}-ver`,
      patientId,
      type: 'HUMAN_VERIFICATION',
      timestamp: now,
      title: `Lab Result ${status === 'CONFIRMED' ? 'Confirmed' : status === 'EDITED' ? 'Edited' : 'Rejected'}`,
      description: `Staff verified test "${finalItem.testName}" (Value: ${finalItem.value} ${finalItem.unit}, Status: ${finalItem.status}). Verification: ${status}.`,
      sourceType: 'USER_PROVIDED',
      referenceId: resultId
    };

    list[index] = {
      ...patient,
      labResults,
      timeline: [timelineEvent, ...(patient.timeline || [])],
      updatedAt: now
    };

    this.setStoredData(list);
    return finalItem;
  }

  /**
   * Saves or regenerates the AI patient-friendly summary for a patient.
   */
  public static savePatientSummary(patientId: string, summary: PatientSummary): void {
    const list = this.getStoredData();
    const index = list.findIndex(p => p.id === patientId);
    if (index === -1) {
      throw new Error(`Patient not found.`);
    }

    const now = new Date().toISOString();
    const patient = list[index];

    const timelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}-sum`,
      patientId,
      type: 'AI_SUMMARY_GENERATED',
      timestamp: now,
      title: 'AI Summary Generated',
      description: `Patient-friendly summary synthesized from ${summary.reportCount} report(s) and structured clinical findings.`,
      sourceType: 'AI_GENERATED'
    };

    list[index] = {
      ...patient,
      aiSummary: summary,
      timeline: [timelineEvent, ...(patient.timeline || [])],
      updatedAt: now
    };

    this.setStoredData(list);
  }

  public static addTimelineNote(patientId: string, title: string, description: string): TimelineEvent {
    const list = this.getStoredData();
    const index = list.findIndex(p => p.id === patientId);
    if (index === -1) {
      throw new Error(`Patient not found.`);
    }

    const now = new Date().toISOString();
    const event: TimelineEvent = {
      id: `tl-${Date.now()}-note`,
      patientId,
      type: 'CLINICAL_NOTE',
      timestamp: now,
      title: title.trim() || 'Clinical Note',
      description: description.trim(),
      sourceType: 'USER_PROVIDED'
    };

    const patient = list[index];
    list[index] = {
      ...patient,
      timeline: [event, ...(patient.timeline || [])],
      updatedAt: now
    };

    this.setStoredData(list);
    return event;
  }

  public static resetToSampleData(): void {
    this.setStoredData(INITIAL_PATIENTS);
  }

  public static clearAllData(): void {
    this.setStoredData([]);
  }

  public static exportJSON(): string {
    return JSON.stringify(this.getStoredData(), null, 2);
  }

  public static importJSON(jsonStr: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'Imported file must contain a JSON array of patients.' };
      }
      for (const p of parsed) {
        if (!p.name || !p.patientId) {
          return { success: false, count: 0, error: 'Each patient in the file must have at least a name and patientId.' };
        }
      }
      this.setStoredData(parsed);
      return { success: true, count: parsed.length };
    } catch (err) {
      return { success: false, count: 0, error: 'Invalid JSON format: ' + (err as Error).message };
    }
  }
}
