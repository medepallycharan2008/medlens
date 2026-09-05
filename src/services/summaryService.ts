import type { Patient, PatientSummary, PatientSummaryFinding } from '../types/patient';

export class SummaryService {
  /**
   * Generates a patient-friendly clinical summary based strictly on available structured records.
   * Does NOT diagnose, does NOT prescribe, and strictly notes reference ranges only when present in source.
   */
  public static generatePatientSummary(patient: Patient): PatientSummary {
    const now = new Date().toISOString();
    const notableFindings: PatientSummaryFinding[] = [];
    const missingInfo: string[] = [];

    // 1. Gather all lab results from patient (ignoring rejected ones)
    const activeResults = (patient.labResults || []).filter(
      r => r.verificationStatus !== 'REJECTED'
    );

    // 2. Identify notable findings (Low or High strictly when source range exists)
    for (const r of activeResults) {
      if (r.status === 'LOW' || r.status === 'HIGH') {
        notableFindings.push({
          testName: r.testName,
          value: r.value,
          unit: r.unit,
          status: r.status,
          referenceRange: r.referenceRange,
          reportDate: r.reportDate,
          sourceReportName: r.sourceReportName
        });
      }
    }

    // 3. Detect missing critical information
    if (!patient.chiefComplaint) {
      missingInfo.push('Chief complaint or primary reason for visit is not recorded.');
    }
    if (!patient.symptoms || patient.symptoms.length === 0) {
      missingInfo.push('No presenting symptoms enumerated in current record.');
    }
    if (!patient.allergies || patient.allergies.length === 0) {
      missingInfo.push('Allergy documentation is empty (confirm whether patient has no known allergies).');
    }
    if (!patient.reports || patient.reports.length === 0) {
      missingInfo.push('No laboratory or diagnostic radiology reports have been attached yet.');
    }

    // Count unverified results
    const unverifiedCount = activeResults.filter(r => r.verificationStatus === 'UNVERIFIED').length;
    if (unverifiedCount > 0) {
      missingInfo.push(`${unverifiedCount} extracted laboratory test ${unverifiedCount === 1 ? 'item is' : 'items are'} awaiting human clinical verification.`);
    }

    // 4. Construct safe, objective summary text
    const paragraphs: string[] = [];

    // Demographic & Profile context
    paragraphs.push(
      `Patient record for ${patient.name} (${patient.age} y/o ${patient.sex}, ID: ${patient.patientId}). ` +
      (patient.chiefComplaint
        ? `Primary reported consultation reason: "${patient.chiefComplaint}".`
        : `No specific chief complaint listed on file.`)
    );

    // Clinical background
    if (patient.conditions && patient.conditions.length > 0) {
      const condList = patient.conditions.map(c => c.condition).join(', ');
      paragraphs.push(`Documented medical conditions on file: ${condList}.`);
    }

    // Laboratory facts (strictly adhering to source ranges)
    if (activeResults.length > 0) {
      const lowCount = activeResults.filter(r => r.status === 'LOW').length;
      const highCount = activeResults.filter(r => r.status === 'HIGH').length;
      const normalCount = activeResults.filter(r => r.status === 'NORMAL').length;
      const noRangeCount = activeResults.filter(r => r.status === 'NOT_DETERMINABLE').length;

      let labSummary = `Laboratory records contain ${activeResults.length} structured test measurements across ${patient.reports?.length || 1} report(s). `;
      
      const statusBreakdown: string[] = [];
      if (normalCount > 0) statusBreakdown.push(`${normalCount} within reported normal limits`);
      if (lowCount > 0) statusBreakdown.push(`${lowCount} lower than source reference interval`);
      if (highCount > 0) statusBreakdown.push(`${highCount} higher than source reference interval`);
      if (noRangeCount > 0) statusBreakdown.push(`${noRangeCount} with status not determinable (source report provided no reference range)`);

      labSummary += statusBreakdown.join(', ') + '.';
      paragraphs.push(labSummary);

      if (notableFindings.length > 0) {
        const notableList = notableFindings
          .map(f => `${f.testName} is ${f.status} (${f.value} ${f.unit}, Source Range: ${f.referenceRange || 'None'})`)
          .join('; ');
        paragraphs.push(`Notable source observations: ${notableList}.`);
      }
    } else {
      paragraphs.push(`No structured laboratory tests are currently attached to this patient record.`);
    }

    // Safety disclaimer
    paragraphs.push(
      `Summary generated objectively from existing staff entries and extracted reports. This summary does not provide diagnoses, treatment recommendations, or medication adjustments.`
    );

    const summaryText = paragraphs.join('\n\n');

    return {
      id: `sum-${Date.now()}`,
      patientId: patient.id,
      generatedAt: now,
      sourceType: 'AI_GENERATED',
      summaryText,
      notableFindings,
      missingInformation: missingInfo,
      reportCount: patient.reports?.length || 0
    };
  }
}
