import { useState, useEffect, useCallback } from 'react';
import type { Patient, MedicalReport, ExtractedReportData, ExtractedLabResult, VerificationStatus, PatientSummary } from '../types/patient';
import { PatientStorageService } from '../services/storage';
import { SummaryService } from '../services/summaryService';

export function usePatients(initialSelectedId?: string) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(initialSelectedId || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = useCallback(() => {
    try {
      setLoading(true);
      const data = PatientStorageService.getAll();
      setPatients(data);
      setError(null);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Unable to load patient records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

  const selectPatient = useCallback((id: string | null) => {
    setSelectedPatientId(id);
  }, []);

  const createPatient = useCallback(async (
    patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'labResults'> & { id?: string; labResults?: ExtractedLabResult[] }
  ): Promise<Patient> => {
    try {
      const created = PatientStorageService.create(patientData);
      loadPatients();
      setSelectedPatientId(created.id);
      return created;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [loadPatients]);

  const updatePatient = useCallback(async (
    id: string,
    updates: Partial<Patient>,
    updateDescription?: string
  ): Promise<Patient> => {
    try {
      const updated = PatientStorageService.update(id, updates, updateDescription);
      loadPatients();
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [loadPatients]);

  const deletePatient = useCallback(async (id: string): Promise<void> => {
    try {
      PatientStorageService.delete(id);
      if (selectedPatientId === id) {
        setSelectedPatientId(null);
      }
      loadPatients();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [selectedPatientId, loadPatients]);

  const addReport = useCallback(async (
    patientId: string,
    reportData: Omit<MedicalReport, 'reportId' | 'patientId' | 'sourceType'>
  ): Promise<MedicalReport> => {
    try {
      const report = PatientStorageService.addReport(patientId, reportData);
      loadPatients();
      return report;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [loadPatients]);

  const addExtractedReport = useCallback(async (
    patientId: string,
    reportData: Omit<MedicalReport, 'reportId' | 'patientId' | 'sourceType'>,
    extractedData: ExtractedReportData
  ): Promise<MedicalReport> => {
    try {
      const report = PatientStorageService.addExtractedReport(patientId, reportData, extractedData);
      loadPatients();
      return report;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [loadPatients]);

  const updateLabResultVerification = useCallback(async (
    patientId: string,
    resultId: string,
    verificationStatus: VerificationStatus,
    updatedResult?: ExtractedLabResult
  ): Promise<ExtractedLabResult> => {
    try {
      const item = PatientStorageService.updateLabResultVerification(patientId, resultId, verificationStatus, updatedResult);
      loadPatients();
      return item;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [loadPatients]);

  const generateAndSaveSummary = useCallback(async (
    patientId: string
  ): Promise<PatientSummary> => {
    try {
      const p = PatientStorageService.getById(patientId);
      if (!p) throw new Error('Patient not found.');
      const summary = SummaryService.generatePatientSummary(p);
      PatientStorageService.savePatientSummary(patientId, summary);
      loadPatients();
      return summary;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [loadPatients]);

  const addTimelineNote = useCallback(async (
    patientId: string,
    title: string,
    description: string
  ): Promise<void> => {
    try {
      PatientStorageService.addTimelineNote(patientId, title, description);
      loadPatients();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [loadPatients]);

  const resetToSample = useCallback(() => {
    PatientStorageService.resetToSampleData();
    loadPatients();
  }, [loadPatients]);

  const clearAll = useCallback(() => {
    PatientStorageService.clearAllData();
    setSelectedPatientId(null);
    loadPatients();
  }, [loadPatients]);

  return {
    patients,
    selectedPatient,
    selectedPatientId,
    loading,
    error,
    selectPatient,
    refreshPatients: loadPatients,
    createPatient,
    updatePatient,
    deletePatient,
    addReport,
    addExtractedReport,
    updateLabResultVerification,
    generateAndSaveSummary,
    addTimelineNote,
    resetToSample,
    clearAll
  };
}
