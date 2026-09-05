import type { ExtractedLabResult, ExtractedReportData, ReportStatus } from '../types/patient';
import { ReferenceRangeService } from './referenceRangeService';

export interface ExtractionTemplate {
  templateId: string;
  name: string;
  description: string;
  department: string;
  labName: string;
  sampleFileName: string;
  hasReferenceRanges: boolean;
  rawText: string;
  extractedItems: Array<{
    testName: string;
    value: string;
    unit: string;
    referenceRange: string | null;
    confidence: number;
    observations?: string;
  }>;
}

export const PRESET_MEDICAL_TEMPLATES: ExtractionTemplate[] = [
  {
    templateId: 'apollo_cbc',
    name: 'Apollo Complete Blood Count (CBC) with Reference Ranges',
    description: 'Standard hematology profile containing explicit source reference ranges.',
    department: 'Hematology',
    labName: 'Apollo Diagnostics Laboratory, Bengaluru',
    sampleFileName: 'apollo_cbc_report_2026.pdf',
    hasReferenceRanges: true,
    rawText: `APOLLO DIAGNOSTICS - CLINICAL PATHOLOGY REPORT
Patient: Registered Outpatient | Date: 05-Sep-2026 | Lab Ref: AP-BLR-88412
TEST NAME                RESULT    UNITS     REFERENCE RANGE     METHOD
-----------------------------------------------------------------------
Hemoglobin               11.4      g/dL      13.0 - 17.0         SLS-Hemoglobin
Total Leukocyte Count    8,400     /cumm     4,000 - 10,500      Flow Cytometry
Platelet Count           210,000   /cumm     150,000 - 450,000   Impedance
Packed Cell Volume (PCV) 34.2      %         40.0 - 50.0         Calculated
Mean Corpuscular Volume  74.0      fL        80.0 - 100.0        Calculated
Red Blood Cell Count     4.1       mil/cumm  4.5 - 5.5           Electrical Impedance
Erythrocyte Sedimentation 28       mm/1st hr 0 - 15              Westergren
-----------------------------------------------------------------------
Impression: Microcytic picture with borderline low hemoglobin. Clinically correlate.`,
    extractedItems: [
      { testName: 'Hemoglobin', value: '11.4', unit: 'g/dL', referenceRange: '13.0 - 17.0', confidence: 0.98 },
      { testName: 'Total Leukocyte Count', value: '8400', unit: '/cumm', referenceRange: '4000 - 10500', confidence: 0.96 },
      { testName: 'Platelet Count', value: '210000', unit: '/cumm', referenceRange: '150000 - 450000', confidence: 0.95 },
      { testName: 'Packed Cell Volume (PCV)', value: '34.2', unit: '%', referenceRange: '40.0 - 50.0', confidence: 0.94 },
      { testName: 'Mean Corpuscular Volume (MCV)', value: '74.0', unit: 'fL', referenceRange: '80.0 - 100.0', confidence: 0.92 },
      { testName: 'Red Blood Cell Count', value: '4.1', unit: 'mil/cumm', referenceRange: '4.5 - 5.5', confidence: 0.91 },
      { testName: 'Erythrocyte Sedimentation Rate (ESR)', value: '28', unit: 'mm/1st hr', referenceRange: '0 - 15', confidence: 0.89 }
    ]
  },
  {
    templateId: 'metropolis_lipid',
    name: 'Metropolis Comprehensive Lipid Profile',
    description: 'Cardiovascular lipid biochemistry with threshold ranges (< 200, > 40, etc.).',
    department: 'Biochemistry',
    labName: 'Metropolis Healthcare Labs, Mumbai',
    sampleFileName: 'metropolis_lipid_profile_2026.pdf',
    hasReferenceRanges: true,
    rawText: `METROPOLIS HEALTHCARE LIMITED - DEPARTMENT OF BIOCHEMISTRY
Sample Type: Serum | Fasting: 12 Hours | Reg Date: 02-Sep-2026
INVESTIGATION            RESULT    UNITS     BIOLOGICAL REFERENCE INTERVAL
---------------------------------------------------------------------------
Total Cholesterol        248       mg/dL     < 200               Enzymatic
Triglycerides            195       mg/dL     < 150               GPO-PAP
HDL Cholesterol (Good)   38        mg/dL     > 40                Direct Measure
LDL Cholesterol (Bad)    162       mg/dL     < 100               Calculated
VLDL Cholesterol         39        mg/dL     < 30                Calculated
Cholesterol / HDL Ratio  6.52      ratio     < 4.5               Calculated
---------------------------------------------------------------------------
Notes: Fasting lipid panel evaluated per adult guidelines.`,
    extractedItems: [
      { testName: 'Total Cholesterol', value: '248', unit: 'mg/dL', referenceRange: '< 200', confidence: 0.97 },
      { testName: 'Triglycerides', value: '195', unit: 'mg/dL', referenceRange: '< 150', confidence: 0.96 },
      { testName: 'HDL Cholesterol', value: '38', unit: 'mg/dL', referenceRange: '> 40', confidence: 0.95 },
      { testName: 'LDL Cholesterol', value: '162', unit: 'mg/dL', referenceRange: '< 100', confidence: 0.94 },
      { testName: 'VLDL Cholesterol', value: '39', unit: 'mg/dL', referenceRange: '< 30', confidence: 0.93 },
      { testName: 'Cholesterol / HDL Ratio', value: '6.52', unit: 'ratio', referenceRange: '< 4.5', confidence: 0.88 }
    ]
  },
  {
    templateId: 'unspecified_no_ref_range',
    name: 'Diagnostic Slip (WITHOUT Reference Ranges)',
    description: 'Simulates a report where the source laboratory omitted reference ranges (Tests Rule #4: Status MUST be NOT DETERMINABLE).',
    department: 'Emergency & Triage',
    labName: 'District Sub-Divisional Hospital Laboratory',
    sampleFileName: 'emergency_spot_report_no_ranges.pdf',
    hasReferenceRanges: false,
    rawText: `DISTRICT HEALTH CENTER - SPOT LAB SLIP
OPD Slip No: 1042 | Date: 04-Sep-2026
NOTE: Spot quick testing slip. Reference intervals not printed on portable strip.
-----------------------------------------------------------------------
TEST                     OBSERVED VALUE    UNIT
-----------------------------------------------------------------------
Random Blood Glucose     182               mg/dL
Serum Creatinine         1.4               mg/dL
Blood Urea Nitrogen      24                mg/dL
Serum Potassium          4.8               mmol/L
Serum Sodium             138               mmol/L
-----------------------------------------------------------------------
Source document does not include reference ranges. Verification required.`,
    extractedItems: [
      { testName: 'Random Blood Glucose', value: '182', unit: 'mg/dL', referenceRange: null, confidence: 0.85 },
      { testName: 'Serum Creatinine', value: '1.4', unit: 'mg/dL', referenceRange: null, confidence: 0.82 },
      { testName: 'Blood Urea Nitrogen (BUN)', value: '24', unit: 'mg/dL', referenceRange: null, confidence: 0.80 },
      { testName: 'Serum Potassium', value: '4.8', unit: 'mmol/L', referenceRange: null, confidence: 0.78 },
      { testName: 'Serum Sodium', value: '138', unit: 'mmol/L', referenceRange: null, confidence: 0.75 }
    ]
  },
  {
    templateId: 'blurry_low_confidence',
    name: 'Scanned Mobile Photo (Partial Quality / Low Confidence)',
    description: 'Tests OCR confidence degradation and "Needs Verification" tagging.',
    department: 'General Laboratory',
    labName: 'City Diagnostic Scan Center',
    sampleFileName: 'mobile_photo_scan_unclear.jpg',
    hasReferenceRanges: true,
    rawText: `CITY SCAN CENTER - HEMOGRAM (LOW CONTRAST SCAN)
[Partial optical recognition due to handwritten margin]
Hemoglobin . . . . 13.1 g/dL (Ref: 12.0 - 15.5) [Confidence: 0.91]
WBC Count . . . . . 6,200 /uL (Ref: 4,000 - 11,000) [Confidence: 0.88]
Thyroid Stimulating Hormone (TSH) . . 5.92 uIU/mL (Ref: 0.35 - 4.94) [Confidence: 0.68 - Blurred]
Serum Calcium . . . ?8.6 mg/dL (Ref: 8.5 - 10.5) [Confidence: 0.62 - Digit smudged]`,
    extractedItems: [
      { testName: 'Hemoglobin', value: '13.1', unit: 'g/dL', referenceRange: '12.0 - 15.5', confidence: 0.91 },
      { testName: 'WBC Count', value: '6200', unit: '/uL', referenceRange: '4000 - 11000', confidence: 0.88 },
      { testName: 'Thyroid Stimulating Hormone (TSH)', value: '5.92', unit: 'uIU/mL', referenceRange: '0.35 - 4.94', confidence: 0.68, observations: 'Digit 5 partially smudged on scan line' },
      { testName: 'Serum Calcium', value: '8.6', unit: 'mg/dL', referenceRange: '8.5 - 10.5', confidence: 0.62, observations: 'Leading character obscured, human check advised' }
    ]
  }
];

export class ExtractionPipelineService {
  /**
   * Processes a document (preset template or uploaded file) through the AI extraction pipeline.
   */
  public static async processDocument(params: {
    patientId: string;
    reportId: string;
    reportName: string;
    file: File | null;
    templateId?: string;
    customText?: string;
  }): Promise<{
    status: ReportStatus;
    extractedData: ExtractedReportData;
    sourceDocumentPreview: string;
    rawText: string;
  }> {
    const { patientId, reportId, reportName, file, templateId, customText } = params;

    // Simulate OCR processing latency (500ms - 800ms) for realistic UX
    await new Promise(resolve => setTimeout(resolve, 600));

    // 1. Select extraction template or build from uploaded file
    let chosenTemplate = PRESET_MEDICAL_TEMPLATES.find(t => t.templateId === templateId);

    if (!chosenTemplate) {
      // If no template explicitly chosen, match based on file name or default to CBC
      const name = (file?.name || reportName).toLowerCase();
      if (name.includes('lipid') || name.includes('cholesterol')) {
        chosenTemplate = PRESET_MEDICAL_TEMPLATES[1];
      } else if (name.includes('no_range') || name.includes('emergency') || name.includes('spot')) {
        chosenTemplate = PRESET_MEDICAL_TEMPLATES[2];
      } else if (name.includes('scan') || name.includes('photo') || name.includes('blurry')) {
        chosenTemplate = PRESET_MEDICAL_TEMPLATES[3];
      } else {
        chosenTemplate = PRESET_MEDICAL_TEMPLATES[0]; // Apollo CBC
      }
    }

    const rawText = customText || chosenTemplate.rawText;
    const reportDate = new Date().toISOString().split('T')[0];

    // 2. Extract structured laboratory items and evaluate reference ranges
    let hasLowConfidenceItem = false;

    const results: ExtractedLabResult[] = chosenTemplate.extractedItems.map((item, index) => {
      const evaluation = ReferenceRangeService.evaluateValueAgainstSourceRange(
        item.value,
        item.referenceRange
      );

      const confidence = item.confidence ?? 0.92;
      const confidenceLevel = confidence >= 0.8 ? 'HIGH' : 'LOW';

      if (confidenceLevel === 'LOW') {
        hasLowConfidenceItem = true;
      }

      return {
        id: `lab-${Date.now()}-${index}`,
        patientId,
        sourceReportId: reportId,
        sourceReportName: reportName,
        testName: item.testName,
        value: item.value, // Preserved exactly
        unit: item.unit,
        referenceRange: item.referenceRange, // Preserved from source or null
        status: evaluation.status, // LOW | NORMAL | HIGH | NOT_DETERMINABLE
        statusReason: evaluation.statusReason,
        confidence,
        confidenceLevel,
        sourceType: 'REPORT_EXTRACTED',
        verificationStatus: 'UNVERIFIED',
        originalExtraction: {
          testName: item.testName,
          value: item.value,
          unit: item.unit,
          referenceRange: item.referenceRange
        },
        reportDate
      };
    });

    // 3. Determine overall Report Status
    const overallStatus: ReportStatus = hasLowConfidenceItem ? 'NEEDS_REVIEW' : 'PROCESSED';

    const extractedData: ExtractedReportData = {
      reportId,
      laboratoryName: chosenTemplate.labName,
      reportDate,
      observations: [
        `Processed via MedLens Optical Pipeline on ${new Date().toLocaleDateString('en-IN')}`,
        hasLowConfidenceItem ? 'One or more items marked with low optical confidence. Staff verification needed.' : 'Optical extraction completed with high clarity.'
      ],
      results,
      extractedAt: new Date().toISOString(),
      rawText
    };

    // 4. Source Document Visual Preview Data URL (Simulated laboratory sheet)
    const sourceDocumentPreview = this.generateDocumentPreviewSvg(chosenTemplate, rawText);

    return {
      status: overallStatus,
      extractedData,
      sourceDocumentPreview,
      rawText
    };
  }

  /**
   * Generates a clean clinical SVG preview representing the original uploaded lab sheet
   * for the side-by-side two-panel Report Viewer.
   */
  private static generateDocumentPreviewSvg(template: ExtractionTemplate, text: string): string {
    const lines = text.split('\n').slice(0, 22);
    const escapedLines = lines.map(line =>
      line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    );

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%" style="background:#ffffff; font-family: 'Courier New', monospace;">
        <rect width="600" height="800" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="20" y="20" width="560" height="60" fill="#f8fafc" stroke="#e2e8f0" rx="4"/>
        <text x="35" y="45" font-size="14" font-weight="bold" fill="#0f766e">${template.labName.toUpperCase()}</text>
        <text x="35" y="65" font-size="11" fill="#64748b">DEPARTMENT OF ${template.department.toUpperCase()} • CERTIFIED REPORT</text>
        
        <line x1="20" y1="95" x2="580" y2="95" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,2"/>
        
        <g transform="translate(30, 120)">
          ${escapedLines.map((line, idx) => `
            <text x="0" y="${idx * 24}" font-size="11" fill="${line.startsWith('---') ? '#94a3b8' : line.includes('Impression') ? '#0f766e' : '#1e293b'}" font-weight="${line.includes('TEST') || line.includes('APOLLO') || line.includes('METROPOLIS') ? 'bold' : 'normal'}">${line}</text>
          `).join('')}
        </g>
        
        <rect x="20" y="730" width="560" height="50" fill="#f1f5f9" stroke="#e2e8f0" rx="4"/>
        <text x="35" y="752" font-size="10" font-weight="bold" fill="#475569">DOCUMENT VERIFICATION STAMP: ORIGINAL SOURCE SLIP</text>
        <text x="35" y="768" font-size="9" fill="#64748b">File: ${template.sampleFileName} • Archival UID: MEDLENS-DOC-${Date.now().toString().slice(-6)}</text>
      </svg>
    `.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  }
}
