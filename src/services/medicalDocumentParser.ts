import Tesseract from 'tesseract.js';
import type { ExtractedLabResult } from '../types/patient';
import { ReferenceRangeService } from './referenceRangeService';

export interface ParseResult {
  rawText: string;
  laboratoryName: string;
  results: ExtractedLabResult[];
  confidence: number;
}

// Common clinical investigations recognized in Indian lab reports
const KNOWN_TEST_PATTERNS: Array<{
  regex: RegExp;
  canonicalName: string;
  defaultUnit?: string;
}> = [
  // Hematology (CBC / Hemogram)
  { regex: /\b(?:hemoglobin|haemoglobin|hb)\b/i, canonicalName: 'Hemoglobin', defaultUnit: 'g/dL' },
  { regex: /\b(?:total\s*(?:leukocyte|leucocyte|wbc)\s*count|tlc|wbc\s*count|white\s*blood\s*cells?)\b/i, canonicalName: 'Total Leukocyte Count (TLC)', defaultUnit: '/cumm' },
  { regex: /\b(?:platelet\s*count|plt|platelets)\b/i, canonicalName: 'Platelet Count', defaultUnit: '/cumm' },
  { regex: /\b(?:packed\s*cell\s*volume|pcv|hematocrit|haematocrit)\b/i, canonicalName: 'Packed Cell Volume (PCV)', defaultUnit: '%' },
  { regex: /\b(?:mean\s*corpuscular\s*volume|mcv)\b/i, canonicalName: 'Mean Corpuscular Volume (MCV)', defaultUnit: 'fL' },
  { regex: /\b(?:mean\s*corpuscular\s*hemoglobin|mch)\b/i, canonicalName: 'Mean Corpuscular Hemoglobin (MCH)', defaultUnit: 'pg' },
  { regex: /\b(?:mchc)\b/i, canonicalName: 'Mean Corpuscular Hemoglobin Conc (MCHC)', defaultUnit: 'g/dL' },
  { regex: /\b(?:rbc\s*count|red\s*blood\s*cells?)\b/i, canonicalName: 'Red Blood Cell Count', defaultUnit: 'mil/cumm' },
  { regex: /\b(?:esr|erythrocyte\s*sedimentation\s*rate)\b/i, canonicalName: 'Erythrocyte Sedimentation Rate (ESR)', defaultUnit: 'mm/1st hr' },

  // Diabetes & Glucose
  { regex: /\b(?:fasting\s*(?:blood\s*)?(?:sugar|glucose)|fbs)\b/i, canonicalName: 'Fasting Blood Glucose', defaultUnit: 'mg/dL' },
  { regex: /\b(?:post\s*prandial\s*(?:blood\s*)?(?:sugar|glucose)|ppbs)\b/i, canonicalName: 'Post Prandial Glucose', defaultUnit: 'mg/dL' },
  { regex: /\b(?:random\s*(?:blood\s*)?(?:sugar|glucose)|rbs)\b/i, canonicalName: 'Random Blood Glucose', defaultUnit: 'mg/dL' },
  { regex: /\b(?:hba1c|glycated\s*hemoglobin|glycosylated\s*hb)\b/i, canonicalName: 'HbA1c (Glycated Hemoglobin)', defaultUnit: '%' },

  // Kidney / Renal Function
  { regex: /\b(?:serum\s*creatinine|creatinine)\b/i, canonicalName: 'Serum Creatinine', defaultUnit: 'mg/dL' },
  { regex: /\b(?:blood\s*urea\s*nitrogen|bun)\b/i, canonicalName: 'Blood Urea Nitrogen (BUN)', defaultUnit: 'mg/dL' },
  { regex: /\b(?:blood\s*urea|urea)\b/i, canonicalName: 'Blood Urea', defaultUnit: 'mg/dL' },
  { regex: /\b(?:uric\s*acid|serum\s*urate)\b/i, canonicalName: 'Serum Uric Acid', defaultUnit: 'mg/dL' },

  // Liver Function (LFT)
  { regex: /\b(?:total\s*bilirubin|serum\s*bilirubin|bilirubin\s*total)\b/i, canonicalName: 'Total Bilirubin', defaultUnit: 'mg/dL' },
  { regex: /\b(?:direct\s*bilirubin|conjugated\s*bilirubin)\b/i, canonicalName: 'Direct Bilirubin', defaultUnit: 'mg/dL' },
  { regex: /\b(?:sgot|ast|aspartate\s*aminotransferase)\b/i, canonicalName: 'SGOT (AST)', defaultUnit: 'U/L' },
  { regex: /\b(?:sgpt|alt|alanine\s*aminotransferase)\b/i, canonicalName: 'SGPT (ALT)', defaultUnit: 'U/L' },
  { regex: /\b(?:alkaline\s*phosphatase|alp)\b/i, canonicalName: 'Alkaline Phosphatase (ALP)', defaultUnit: 'U/L' },
  { regex: /\b(?:total\s*protein)\b/i, canonicalName: 'Total Protein', defaultUnit: 'g/dL' },
  { regex: /\b(?:serum\s*albumin|albumin)\b/i, canonicalName: 'Albumin', defaultUnit: 'g/dL' },

  // Lipid Profile
  { regex: /\b(?:total\s*cholesterol|cholesterol\s*total)\b/i, canonicalName: 'Total Cholesterol', defaultUnit: 'mg/dL' },
  { regex: /\b(?:triglycerides|tg)\b/i, canonicalName: 'Triglycerides', defaultUnit: 'mg/dL' },
  { regex: /\b(?:hdl\s*cholesterol|hdl)\b/i, canonicalName: 'HDL Cholesterol', defaultUnit: 'mg/dL' },
  { regex: /\b(?:ldl\s*cholesterol|ldl)\b/i, canonicalName: 'LDL Cholesterol', defaultUnit: 'mg/dL' },
  { regex: /\b(?:vldl\s*cholesterol|vldl)\b/i, canonicalName: 'VLDL Cholesterol', defaultUnit: 'mg/dL' },

  // Thyroid
  { regex: /\b(?:tsh|thyroid\s*stimulating\s*hormone)\b/i, canonicalName: 'TSH (Thyroid Stimulating Hormone)', defaultUnit: 'uIU/mL' },
  { regex: /\b(?:free\s*t4|ft4)\b/i, canonicalName: 'Free T4', defaultUnit: 'ng/dL' },
  { regex: /\b(?:total\s*t4|t4)\b/i, canonicalName: 'Total T4', defaultUnit: 'ug/dL' },
  { regex: /\b(?:total\s*t3|t3)\b/i, canonicalName: 'Total T3', defaultUnit: 'ng/dL' },

  // Electrolytes & Minerals
  { regex: /\b(?:serum\s*sodium|sodium|na\+?)\b/i, canonicalName: 'Serum Sodium', defaultUnit: 'mmol/L' },
  { regex: /\b(?:serum\s*potassium|potassium|k\+?)\b/i, canonicalName: 'Serum Potassium', defaultUnit: 'mmol/L' },
  { regex: /\b(?:serum\s*chloride|chloride|cl-?)\b/i, canonicalName: 'Serum Chloride', defaultUnit: 'mmol/L' },
  { regex: /\b(?:serum\s*calcium|calcium)\b/i, canonicalName: 'Serum Calcium', defaultUnit: 'mg/dL' },
  { regex: /\b(?:vitamin\s*d|25-oh\s*vitamin\s*d)\b/i, canonicalName: 'Vitamin D (25-OH)', defaultUnit: 'ng/mL' },
  { regex: /\b(?:vitamin\s*b12|b12)\b/i, canonicalName: 'Vitamin B12', defaultUnit: 'pg/mL' }
];

export class MedicalDocumentParser {
  /**
   * Performs optical character recognition on an image/document file,
   * extracts text, and parses structured medical parameters.
   */
  public static async parseDocumentFile(
    file: File | Blob,
    patientId: string,
    reportId: string,
    reportName: string,
    onProgress?: (progress: { status: string; progress: number }) => void
  ): Promise<ParseResult> {
    try {
      // 1. Run Tesseract OCR on the uploaded image
      const ocrResult = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (onProgress && m.status) {
            onProgress({
              status: m.status === 'recognizing text' ? `Recognizing optical document text (${Math.round((m.progress || 0) * 100)}%)...` : 'Initializing OCR engine...',
              progress: m.progress || 0
            });
          }
        }
      });

      const rawText = ocrResult.data.text || '';
      const confidence = (ocrResult.data.confidence || 75) / 100;

      // 2. Detect laboratory / clinic name from header lines
      const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      let detectedLab = 'Clinical Diagnostic Laboratory';
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        if (/hospital|diagnostics|laboratory|pathology|clinic|healthcare|labs|center/i.test(line)) {
          detectedLab = line.replace(/[^a-zA-Z0-9\s,&.-]/g, '').trim();
          break;
        }
      }

      // 3. Extract laboratory parameters from lines
      const extractedResults = this.extractParametersFromText(rawText, patientId, reportId, reportName, confidence);

      return {
        rawText,
        laboratoryName: detectedLab,
        results: extractedResults,
        confidence
      };
    } catch (err) {
      console.error('Tesseract OCR failed, attempting fallback text parsing:', err);
      throw err;
    }
  }

  /**
   * Parses structured lab parameters from recognized OCR text.
   */
  public static extractParametersFromText(
    rawText: string,
    patientId: string,
    reportId: string,
    reportName: string,
    baseConfidence: number
  ): ExtractedLabResult[] {
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const results: ExtractedLabResult[] = [];
    const seenTests = new Set<string>();
    const reportDate = new Date().toISOString().split('T')[0];

    // Pass 1: Look for Known Medical Tests
    for (const line of lines) {
      // Ignore header/footer lines
      if (/patient\s*name|doctor|page\s*\d|sample\s*id|collected|reported|ref\s*by/i.test(line)) {
        continue;
      }

      for (const pattern of KNOWN_TEST_PATTERNS) {
        if (pattern.regex.test(line) && !seenTests.has(pattern.canonicalName)) {
          // Attempt to extract numeric value, unit, and reference range from this line
          const parsed = this.parseLineValues(line, pattern.defaultUnit);
          if (parsed) {
            seenTests.add(pattern.canonicalName);
            const evalResult = ReferenceRangeService.evaluateValueAgainstSourceRange(
              parsed.value,
              parsed.referenceRange
            );

            results.push({
              id: `lab-${Date.now()}-${results.length}`,
              patientId,
              sourceReportId: reportId,
              sourceReportName: reportName,
              testName: pattern.canonicalName,
              value: parsed.value,
              unit: parsed.unit || pattern.defaultUnit || '',
              referenceRange: parsed.referenceRange,
              status: evalResult.status,
              statusReason: evalResult.statusReason,
              confidence: baseConfidence,
              confidenceLevel: baseConfidence >= 0.8 ? 'HIGH' : 'LOW',
              sourceType: 'REPORT_EXTRACTED',
              verificationStatus: 'UNVERIFIED',
              originalExtraction: {
                testName: pattern.canonicalName,
                value: parsed.value,
                unit: parsed.unit || pattern.defaultUnit || '',
                referenceRange: parsed.referenceRange
              },
              reportDate
            });
            break;
          }
        }
      }
    }

    // Pass 2: If few or no known tests found, try generic pattern matching:
    // Format: "TestName ... Value Unit ... [RefRange]"
    if (results.length < 2) {
      for (const line of lines) {
        // Skip obvious non-test lines
        if (line.length < 5 || line.length > 100) continue;
        if (/^(date|time|patient|doctor|dr\.|age|sex|gender|address|phone|mrn|opd|ipd)/i.test(line)) continue;

        // Match: Name (letters), Value (number), optional Unit, optional Reference range
        const genericMatch = line.match(/^([A-Za-z\s()/-]{3,35})\s+([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z/%μu]{1,12})?(?:\s+([0-9.<>\s-]+(?:\s*-\s*[0-9.]+)?))?/);
        if (genericMatch) {
          const testName = genericMatch[1].trim();
          const value = genericMatch[2].trim();
          const unit = genericMatch[3]?.trim() || '';
          let range: string | null = genericMatch[4]?.trim() || null;

          if (range && !/[0-9]/.test(range)) {
            range = null;
          }

          if (!seenTests.has(testName.toLowerCase()) && testName.length > 2) {
            seenTests.add(testName.toLowerCase());
            const evalResult = ReferenceRangeService.evaluateValueAgainstSourceRange(value, range);

            results.push({
              id: `lab-${Date.now()}-${results.length}`,
              patientId,
              sourceReportId: reportId,
              sourceReportName: reportName,
              testName,
              value,
              unit,
              referenceRange: range,
              status: evalResult.status,
              statusReason: evalResult.statusReason,
              confidence: baseConfidence * 0.9,
              confidenceLevel: 'LOW',
              sourceType: 'REPORT_EXTRACTED',
              verificationStatus: 'UNVERIFIED',
              originalExtraction: {
                testName,
                value,
                unit,
                referenceRange: range
              },
              reportDate
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Helper to parse value, unit, and reference range from a single line of text
   */
  private static parseLineValues(line: string, defaultUnit?: string): {
    value: string;
    unit: string;
    referenceRange: string | null;
  } | null {
    // Look for numbers on the line
    // Find all numbers (e.g. 13.5, 8400, 210000, < 200, 13.0 - 17.0)
    const numbersWithContext = line.match(/(?:<|>|<=|>=)?\s*[0-9]+(?:\.[0-9]+)?/g);
    if (!numbersWithContext || numbersWithContext.length === 0) {
      return null;
    }

    // First number is usually the observed value
    const firstNumMatch = line.match(/\b([0-9]+(?:\.[0-9]+)?)\b/);
    if (!firstNumMatch) return null;
    const value = firstNumMatch[1];

    // Detect unit
    let unit = defaultUnit || '';
    const unitMatch = line.match(/\b(g\/dL|mg\/dL|mmol\/L|uIU\/mL|µIU\/mL|\/cumm|\/uL|mil\/cumm|%|fL|pg|mm\/1st\s*hr|U\/L|ng\/dL|ng\/mL|ug\/dL|pg\/mL)\b/i);
    if (unitMatch) {
      unit = unitMatch[1];
    }

    // Look for reference range (e.g. "13.0 - 17.0" or "4000 - 10500" or "< 200" or "> 40")
    let referenceRange: string | null = null;
    const rangeMatch = line.match(/([0-9]+(?:\.[0-9]+)?\s*(?:-|–|to)\s*[0-9]+(?:\.[0-9]+)?)/i);
    if (rangeMatch) {
      referenceRange = rangeMatch[1].trim();
    } else {
      const thresholdMatch = line.match(/(?:<|>|<=|>=)\s*[0-9]+(?:\.[0-9]+)?/);
      if (thresholdMatch) {
        referenceRange = thresholdMatch[0].trim();
      }
    }

    return {
      value,
      unit,
      referenceRange
    };
  }
}
