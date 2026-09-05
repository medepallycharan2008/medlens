import { describe, it, expect } from 'vitest';
import { ReferenceRangeService } from '../services/referenceRangeService';

describe('ReferenceRangeService - Source-Only Medical Reference Range Policy', () => {
  describe('Numeric Interval Ranges (min - max)', () => {
    const range = '13.0 - 17.0';

    it('identifies value below range as LOW', () => {
      const evaluation = ReferenceRangeService.evaluateValueAgainstSourceRange('11.4', range);
      expect(evaluation.status).toBe('LOW');
      expect(evaluation.isProvidedInReport).toBe(true);
      expect(evaluation.min).toBe(13.0);
      expect(evaluation.max).toBe(17.0);
      expect(evaluation.statusReason).toContain('below');
    });

    it('identifies value within range as NORMAL', () => {
      const evaluation = ReferenceRangeService.evaluateValueAgainstSourceRange('14.5', range);
      expect(evaluation.status).toBe('NORMAL');
      expect(evaluation.isProvidedInReport).toBe(true);
      expect(evaluation.statusReason).toContain('within');
    });

    it('identifies value above range as HIGH', () => {
      const evaluation = ReferenceRangeService.evaluateValueAgainstSourceRange('18.2', range);
      expect(evaluation.status).toBe('HIGH');
      expect(evaluation.isProvidedInReport).toBe(true);
      expect(evaluation.statusReason).toContain('above');
    });

    it('handles large integer counts (e.g. Platelets 150000 - 450000)', () => {
      const plateletRange = '150000 - 450000';
      expect(ReferenceRangeService.evaluateValueAgainstSourceRange('210000', plateletRange).status).toBe('NORMAL');
      expect(ReferenceRangeService.evaluateValueAgainstSourceRange('120000', plateletRange).status).toBe('LOW');
      expect(ReferenceRangeService.evaluateValueAgainstSourceRange('520000', plateletRange).status).toBe('HIGH');
    });

    it('handles en-dash and "to" variations in printed ranges', () => {
      expect(ReferenceRangeService.evaluateValueAgainstSourceRange('14.0', '13.0 – 17.0').status).toBe('NORMAL');
      expect(ReferenceRangeService.evaluateValueAgainstSourceRange('14.0', '13.0 to 17.0').status).toBe('NORMAL');
    });
  });

  describe('Threshold / Boundary Ranges (<, >, <=, >=)', () => {
    it('handles less-than thresholds (< 200 Total Cholesterol)', () => {
      const range = '< 200';
      const normalEval = ReferenceRangeService.evaluateValueAgainstSourceRange('175', range);
      expect(normalEval.status).toBe('NORMAL');

      const highEval = ReferenceRangeService.evaluateValueAgainstSourceRange('248', range);
      expect(highEval.status).toBe('HIGH');
      expect(highEval.statusReason).toContain('exceeds the source threshold');
    });

    it('handles greater-than thresholds (> 40 HDL Cholesterol)', () => {
      const range = '> 40';
      const normalEval = ReferenceRangeService.evaluateValueAgainstSourceRange('52', range);
      expect(normalEval.status).toBe('NORMAL');

      const lowEval = ReferenceRangeService.evaluateValueAgainstSourceRange('32', range);
      expect(lowEval.status).toBe('LOW');
      expect(lowEval.statusReason).toContain('below the source threshold');
    });

    it('handles less-than-or-equal thresholds (<= 100)', () => {
      const range = '<= 100';
      expect(ReferenceRangeService.evaluateValueAgainstSourceRange('100', range).status).toBe('NORMAL');
      expect(ReferenceRangeService.evaluateValueAgainstSourceRange('101', range).status).toBe('HIGH');
    });

    it('handles greater-than-or-equal thresholds (>= 60)', () => {
      const range = '>= 60';
      expect(ReferenceRangeService.evaluateValueAgainstSourceRange('60', range).status).toBe('NORMAL');
      expect(ReferenceRangeService.evaluateValueAgainstSourceRange('59', range).status).toBe('LOW');
    });
  });

  describe('CRITICAL RULE: Missing Reference Range Behavior (Never Invent Ranges)', () => {
    it('strictly returns NOT_DETERMINABLE when referenceRange is null', () => {
      const evaluation = ReferenceRangeService.evaluateValueAgainstSourceRange('182', null);
      expect(evaluation.status).toBe('NOT_DETERMINABLE');
      expect(evaluation.isProvidedInReport).toBe(false);
      expect(evaluation.statusReason).toContain('Reference range not provided in source report');
    });

    it('strictly returns NOT_DETERMINABLE when referenceRange is undefined', () => {
      const evaluation = ReferenceRangeService.evaluateValueAgainstSourceRange('1.4', undefined);
      expect(evaluation.status).toBe('NOT_DETERMINABLE');
      expect(evaluation.isProvidedInReport).toBe(false);
      expect(evaluation.statusReason).toContain('Reference range not provided in source report');
    });

    it('strictly returns NOT_DETERMINABLE when referenceRange is empty string or whitespace', () => {
      const evaluation = ReferenceRangeService.evaluateValueAgainstSourceRange('138', '   ');
      expect(evaluation.status).toBe('NOT_DETERMINABLE');
      expect(evaluation.isProvidedInReport).toBe(false);
    });

    it('strictly returns NOT_DETERMINABLE when referenceRange states "not provided"', () => {
      const evaluation = ReferenceRangeService.evaluateValueAgainstSourceRange('24', 'Not provided in source report');
      expect(evaluation.status).toBe('NOT_DETERMINABLE');
      expect(evaluation.isProvidedInReport).toBe(false);
    });
  });

  describe('Qualitative and Non-Numeric Tests', () => {
    it('matches qualitative expected normal findings (e.g. Negative)', () => {
      const evaluation = ReferenceRangeService.evaluateValueAgainstSourceRange('Negative', 'Negative');
      expect(evaluation.status).toBe('NORMAL');
      expect(evaluation.isProvidedInReport).toBe(true);
    });

    it('flags qualitative values that cannot be mapped as NOT_DETERMINABLE', () => {
      const evaluation = ReferenceRangeService.evaluateValueAgainstSourceRange('Trace', 'Negative');
      expect(evaluation.status).toBe('NOT_DETERMINABLE');
      expect(evaluation.statusReason).toContain('cannot be mapped');
    });
  });
});
