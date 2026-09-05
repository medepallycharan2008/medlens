import { describe, it, expect } from 'vitest';
import { MedicalDocumentParser } from '../services/medicalDocumentParser';
import { ExtractionPipelineService, PRESET_MEDICAL_TEMPLATES } from '../services/extractionPipeline';

describe('Document Processing & Optical Extraction Pipeline', () => {
  describe('MedicalDocumentParser - Text Parameter Extraction', () => {
    it('extracts hematology parameters from OCR text', () => {
      const sampleText = `
        METROPOLIS CLINICAL PATHOLOGY
        Hemoglobin: 12.8 g/dL (Ref: 12.0 - 15.5)
        Total Leukocyte Count 6800 /cumm 4000 - 10500
        Platelet Count: 250000 /cumm 150000 - 450000
        Packed Cell Volume 38.0 % 36.0 - 46.0
        ESR 18 mm/1st hr 0 - 20
      `;

      const results = MedicalDocumentParser.extractParametersFromText(
        sampleText,
        'p-1',
        'rep-1',
        'Hematology_Report.pdf',
        0.95
      );

      expect(results.length).toBeGreaterThanOrEqual(4);

      const hb = results.find(r => r.testName === 'Hemoglobin');
      expect(hb).toBeDefined();
      expect(hb?.value).toBe('12.8');
      expect(hb?.unit).toBe('g/dL');
      expect(hb?.referenceRange).toBe('12.0 - 15.5');
      expect(hb?.status).toBe('NORMAL');

      const platelets = results.find(r => r.testName === 'Platelet Count');
      expect(platelets).toBeDefined();
      expect(platelets?.value).toBe('250000');
      expect(platelets?.status).toBe('NORMAL');
    });

    it('extracts biochemistry and lipid profile parameters with threshold ranges', () => {
      const lipidText = `
        DEPARTMENT OF BIOCHEMISTRY
        Total Cholesterol 245 mg/dL < 200
        Triglycerides 190 mg/dL < 150
        HDL Cholesterol 35 mg/dL > 40
        LDL Cholesterol 160 mg/dL < 100
        Serum Creatinine 1.0 mg/dL 0.6 - 1.2
        Fasting Blood Glucose 115 mg/dL 70 - 100
      `;

      const results = MedicalDocumentParser.extractParametersFromText(
        lipidText,
        'p-1',
        'rep-2',
        'Lipid_Profile.pdf',
        0.94
      );

      const chol = results.find(r => r.testName === 'Total Cholesterol');
      expect(chol).toBeDefined();
      expect(chol?.value).toBe('245');
      expect(chol?.status).toBe('HIGH');

      const hdl = results.find(r => r.testName === 'HDL Cholesterol');
      expect(hdl).toBeDefined();
      expect(hdl?.value).toBe('35');
      expect(hdl?.status).toBe('LOW');

      const glucose = results.find(r => r.testName === 'Fasting Blood Glucose');
      expect(glucose).toBeDefined();
      expect(glucose?.value).toBe('115');
      expect(glucose?.status).toBe('HIGH');
    });

    it('extracts parameters without reference ranges and marks status as NOT_DETERMINABLE', () => {
      const slipWithoutRanges = `
        EMERGENCY SPOT TESTING SLIP
        Random Blood Glucose: 195 mg/dL
        Blood Urea: 42 mg/dL
        Serum Creatinine: 1.5 mg/dL
      `;

      const results = MedicalDocumentParser.extractParametersFromText(
        slipWithoutRanges,
        'p-1',
        'rep-3',
        'Spot_Slip.pdf',
        0.88
      );

      expect(results.length).toBeGreaterThanOrEqual(2);
      for (const res of results) {
        expect(res.referenceRange).toBeNull();
        expect(res.status).toBe('NOT_DETERMINABLE');
        expect(res.statusReason).toContain('Reference range not provided');
      }
    });

    it('handles generic pattern lines matching "Name Value Unit Range"', () => {
      const customReport = `
        SPECIAL INVESTIGATIONS
        Serum Homocysteine 14.2 umol/L 5.0 - 15.0
        Ferritin 85 ng/mL 20 - 250
      `;

      const results = MedicalDocumentParser.extractParametersFromText(
        customReport,
        'p-1',
        'rep-4',
        'Special_Labs.pdf',
        0.90
      );

      expect(results.length).toBeGreaterThanOrEqual(1);
      const ferritin = results.find(r => r.testName.toLowerCase().includes('ferritin'));
      expect(ferritin).toBeDefined();
      expect(ferritin?.value).toBe('85');
    });
  });

  describe('ExtractionPipelineService - Templates and Processing Flow', () => {
    it('has preset medical templates representing standard Indian diagnostic labs', () => {
      expect(PRESET_MEDICAL_TEMPLATES.length).toBeGreaterThanOrEqual(3);
      const cbcTmpl = PRESET_MEDICAL_TEMPLATES.find(t => t.templateId === 'apollo_cbc');
      expect(cbcTmpl).toBeDefined();
      expect(cbcTmpl?.hasReferenceRanges).toBe(true);

      const noRangeTmpl = PRESET_MEDICAL_TEMPLATES.find(t => t.templateId === 'unspecified_no_ref_range');
      expect(noRangeTmpl).toBeDefined();
      expect(noRangeTmpl?.hasReferenceRanges).toBe(false);
    });

    it('processes preset template without a file into structured lab results', async () => {
      const output = await ExtractionPipelineService.processDocument({
        patientId: 'p-100',
        reportId: 'rep-100',
        reportName: 'Apollo CBC Report',
        file: null,
        templateId: 'apollo_cbc'
      });

      expect(output.status).toBe('PROCESSED');
      expect(output.extractedData.results.length).toBeGreaterThan(0);
      expect(output.sourceDocumentPreview).toContain('data:image/svg+xml');

      const hb = output.extractedData.results.find(r => r.testName === 'Hemoglobin');
      expect(hb).toBeDefined();
      expect(hb?.value).toBe('11.4');
      expect(hb?.status).toBe('LOW');
    });

    it('strictly returns NOT_DETERMINABLE for all tests in unprovided reference range template', async () => {
      const output = await ExtractionPipelineService.processDocument({
        patientId: 'p-100',
        reportId: 'rep-101',
        reportName: 'Emergency Slip No Ranges',
        file: null,
        templateId: 'unspecified_no_ref_range'
      });

      expect(output.extractedData.results.length).toBeGreaterThan(0);
      for (const item of output.extractedData.results) {
        expect(item.referenceRange).toBeNull();
        expect(item.status).toBe('NOT_DETERMINABLE');
      }
    });
  });
});
