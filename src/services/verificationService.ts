import type { ExtractedLabResult } from '../types/patient';
import { ReferenceRangeService } from './referenceRangeService';

export class VerificationService {
  /**
   * Confirms an extracted lab result as human verified without changing values.
   */
  public static confirmResult(
    result: ExtractedLabResult,
    staffName: string = 'Staff Nurse / Medical Officer'
  ): ExtractedLabResult {
    const now = new Date().toISOString();
    return {
      ...result,
      verificationStatus: 'CONFIRMED',
      verifiedBy: staffName,
      verifiedAt: now
    };
  }

  /**
   * Rejects an inaccurate or falsely recognized extracted lab result.
   */
  public static rejectResult(
    result: ExtractedLabResult,
    staffName: string = 'Staff Nurse / Medical Officer'
  ): ExtractedLabResult {
    const now = new Date().toISOString();
    return {
      ...result,
      verificationStatus: 'REJECTED',
      verifiedBy: staffName,
      verifiedAt: now
    };
  }

  /**
   * Edits an extracted lab result, re-evaluates the reference range, and updates verification status.
   */
  public static editResult(params: {
    result: ExtractedLabResult;
    newValue: string;
    newUnit?: string;
    newReferenceRange?: string | null;
    staffName?: string;
  }): ExtractedLabResult {
    const { result, newValue, newUnit, newReferenceRange, staffName = 'Staff Nurse / Medical Officer' } = params;
    const now = new Date().toISOString();

    const rangeToUse = newReferenceRange !== undefined ? newReferenceRange : result.referenceRange;
    const unitToUse = newUnit !== undefined ? newUnit : result.unit;

    // Re-evaluate value against source range
    const evaluation = ReferenceRangeService.evaluateValueAgainstSourceRange(newValue, rangeToUse);

    return {
      ...result,
      value: newValue.trim(),
      unit: unitToUse.trim(),
      referenceRange: rangeToUse,
      status: evaluation.status,
      statusReason: evaluation.statusReason,
      verificationStatus: 'EDITED',
      verifiedBy: staffName,
      verifiedAt: now,
      // Original extraction remains preserved in originalExtraction for audit integrity
      originalExtraction: result.originalExtraction || {
        testName: result.testName,
        value: result.value,
        unit: result.unit,
        referenceRange: result.referenceRange
      }
    };
  }

  /**
   * Confirms an extracted lab result by the patient before persistence.
   */
  public static patientConfirmResult(result: ExtractedLabResult): ExtractedLabResult {
    const now = new Date().toISOString();
    return {
      ...result,
      verificationStatus: 'PATIENT_CONFIRMED',
      patientConfirmedAt: now
    };
  }

  /**
   * Stamped by attending doctor verifying the extracted laboratory value.
   */
  public static doctorVerifyResult(
    result: ExtractedLabResult,
    doctorName: string = 'Dr. A. Deshmukh, MD'
  ): ExtractedLabResult {
    const now = new Date().toISOString();
    return {
      ...result,
      verificationStatus: 'DOCTOR_VERIFIED',
      doctorVerifiedBy: doctorName,
      doctorVerifiedAt: now,
      verifiedBy: doctorName,
      verifiedAt: now
    };
  }
}
