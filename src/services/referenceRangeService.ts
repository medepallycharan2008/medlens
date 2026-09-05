import type { LabResultStatus } from '../types/patient';

export interface RangeEvaluation {
  status: LabResultStatus;
  statusReason: string;
  isProvidedInReport: boolean;
  min?: number;
  max?: number;
}

export class ReferenceRangeService {
  /**
   * Evaluates an extracted test value strictly against the source reference range.
   * If sourceReferenceRange is null, undefined, or empty, it strictly returns 'NOT_DETERMINABLE'
   * without ever inferring or inventing a medical range.
   */
  public static evaluateValueAgainstSourceRange(
    rawValue: string,
    sourceReferenceRange: string | null | undefined
  ): RangeEvaluation {
    // 1. Strict Check: If no reference range was provided in the report
    if (!sourceReferenceRange || sourceReferenceRange.trim().length === 0 || sourceReferenceRange.toLowerCase().includes('not provided')) {
      return {
        status: 'NOT_DETERMINABLE',
        statusReason: 'Reference range not provided in source report. Status cannot be determined from the provided report.',
        isProvidedInReport: false
      };
    }

    const trimmedRange = sourceReferenceRange.trim();
    const cleanValue = rawValue.trim();
    const numValue = parseFloat(cleanValue.replace(/[^0-9.-]/g, ''));

    // If value is non-numeric (e.g. "Negative", "Reactive", "Clear")
    if (isNaN(numValue)) {
      // Check qualitative match if range specifies Expected/Normal value (e.g. "Negative" or "Non-Reactive")
      const lowerRange = trimmedRange.toLowerCase();
      const lowerVal = cleanValue.toLowerCase();

      if (lowerRange.includes(lowerVal)) {
        return {
          status: 'NORMAL',
          statusReason: `Extracted value matches source report expected finding ("${trimmedRange}").`,
          isProvidedInReport: true
        };
      } else {
        return {
          status: 'NOT_DETERMINABLE',
          statusReason: `Qualitative value cannot be mapped to source range "${trimmedRange}".`,
          isProvidedInReport: true
        };
      }
    }

    // 2. Parse Numeric Range Patterns
    // Pattern A: "13.0 - 17.0" or "13.0 – 17.0" or "13.0 to 17.0"
    const hyphenMatch = trimmedRange.match(/([0-9.]+)\s*(?:-|–|to)\s*([0-9.]+)/i);
    if (hyphenMatch) {
      const min = parseFloat(hyphenMatch[1]);
      const max = parseFloat(hyphenMatch[2]);

      if (!isNaN(min) && !isNaN(max)) {
        if (numValue < min) {
          return {
            status: 'LOW',
            statusReason: `Value ${numValue} is below the source reference range (${min} – ${max}).`,
            isProvidedInReport: true,
            min,
            max
          };
        }
        if (numValue > max) {
          return {
            status: 'HIGH',
            statusReason: `Value ${numValue} is above the source reference range (${min} – ${max}).`,
            isProvidedInReport: true,
            min,
            max
          };
        }
        return {
          status: 'NORMAL',
          statusReason: `Value ${numValue} is within the source reference range (${min} – ${max}).`,
          isProvidedInReport: true,
          min,
          max
        };
      }
    }

    // Pattern B: "< 100" or "<= 100" or "Less than 100"
    const lessThanMatch = trimmedRange.match(/(?:<|<=|less\s+than)\s*([0-9.]+)/i);
    if (lessThanMatch) {
      const threshold = parseFloat(lessThanMatch[1]);
      if (!isNaN(threshold)) {
        if (numValue > threshold) {
          return {
            status: 'HIGH',
            statusReason: `Value ${numValue} exceeds the source threshold (< ${threshold}).`,
            isProvidedInReport: true,
            max: threshold
          };
        }
        return {
          status: 'NORMAL',
          statusReason: `Value ${numValue} meets the source threshold (< ${threshold}).`,
          isProvidedInReport: true,
          max: threshold
        };
      }
    }

    // Pattern C: "> 40" or ">= 40" or "Greater than 40"
    const greaterThanMatch = trimmedRange.match(/(?:>|>=|greater\s+than)\s*([0-9.]+)/i);
    if (greaterThanMatch) {
      const threshold = parseFloat(greaterThanMatch[1]);
      if (!isNaN(threshold)) {
        if (numValue < threshold) {
          return {
            status: 'LOW',
            statusReason: `Value ${numValue} is below the source threshold (> ${threshold}).`,
            isProvidedInReport: true,
            min: threshold
          };
        }
        return {
          status: 'NORMAL',
          statusReason: `Value ${numValue} meets the source threshold (> ${threshold}).`,
          isProvidedInReport: true,
          min: threshold
        };
      }
    }

    // If range string exists but format could not be unambiguously parsed numerically
    return {
      status: 'NOT_DETERMINABLE',
      statusReason: `Source reference range "${trimmedRange}" could not be mathematically evaluated.`,
      isProvidedInReport: true
    };
  }
}
