import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingPage } from '../components/auth/LandingPage';
import { PatientLogin } from '../components/auth/PatientLogin';
import { DoctorLogin } from '../components/auth/DoctorLogin';
import { LabStatusBadge, VerificationBadge, SourceBadge } from '../components/common/Badge';
import { LabResultsTable } from '../components/patients/LabResultsTable';
import type { ExtractedLabResult } from '../types/patient';

describe('UI Component Tests - User Interactions & Badges', () => {
  describe('LandingPage Component', () => {
    it('renders MedLens branding and medical safety notice banner', () => {
      const handleSelectRole = vi.fn();
      render(<LandingPage onSelectRole={handleSelectRole} />);

      expect(screen.getByRole('heading', { level: 1, name: /MedLens/i })).toBeInTheDocument();
      expect(screen.getByText(/This application organizes and summarizes medical information/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Patient' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Doctor' })).toBeInTheDocument();
    });

    it('triggers onSelectRole with "patient" when Patient card is clicked', () => {
      const handleSelectRole = vi.fn();
      render(<LandingPage onSelectRole={handleSelectRole} />);

      const patientBtn = screen.getByRole('button', { name: /Patient Login/i });
      fireEvent.click(patientBtn);

      expect(handleSelectRole).toHaveBeenCalledWith('patient');
    });

    it('triggers onSelectRole with "doctor" when Doctor card is clicked', () => {
      const handleSelectRole = vi.fn();
      render(<LandingPage onSelectRole={handleSelectRole} />);

      const doctorBtn = screen.getByRole('button', { name: /Doctor Login/i });
      fireEvent.click(doctorBtn);

      expect(handleSelectRole).toHaveBeenCalledWith('doctor');
    });
  });

  describe('PatientLogin Component', () => {
    it('displays validation error if submitted empty', () => {
      const handleLoginSuccess = vi.fn();
      const handleBack = vi.fn();

      render(<PatientLogin onLoginSuccess={handleLoginSuccess} onBackToLanding={handleBack} />);

      const submitBtn = screen.getByRole('button', { name: /Login to Patient Portal/i });
      fireEvent.submit(submitBtn.closest('form')!);

      expect(screen.getByText(/Please enter your Patient ID/i)).toBeInTheDocument();
      expect(handleLoginSuccess).not.toHaveBeenCalled();
    });

    it('logs in immediately via 1-click demo patient account', () => {
      const handleLoginSuccess = vi.fn();
      const handleBack = vi.fn();

      render(<PatientLogin onLoginSuccess={handleLoginSuccess} onBackToLanding={handleBack} />);

      // Find quick demo button for Ramesh Sharma
      const demoBtn = screen.getByRole('button', { name: /Ramesh Sharma/i });
      fireEvent.click(demoBtn);

      expect(handleLoginSuccess).toHaveBeenCalledTimes(1);
      const user = handleLoginSuccess.mock.calls[0][0];
      expect(user.name).toBe('Ramesh Sharma');
      expect(user.patientId).toBe('ML-2026-1001');
    });
  });

  describe('DoctorLogin Component', () => {
    it('renders clinician login and performs 1-click doctor login', () => {
      const handleLoginSuccess = vi.fn();
      const handleBack = vi.fn();

      render(<DoctorLogin onLoginSuccess={handleLoginSuccess} onBackToLanding={handleBack} />);

      expect(screen.getByText(/Doctor Clinical Login/i)).toBeInTheDocument();

      const demoBtn = screen.getByRole('button', { name: /Dr\. A\. Deshmukh/i });
      fireEvent.click(demoBtn);

      expect(handleLoginSuccess).toHaveBeenCalledTimes(1);
      const doc = handleLoginSuccess.mock.calls[0][0];
      expect(doc.name).toContain('Dr. A. Deshmukh');
    });
  });

  describe('Badge Components', () => {
    it('renders LabStatusBadge variants correctly', () => {
      const { rerender } = render(<LabStatusBadge status="LOW" />);
      expect(screen.getByText(/LOW/i)).toBeInTheDocument();

      rerender(<LabStatusBadge status="NORMAL" />);
      expect(screen.getByText(/NORMAL/i)).toBeInTheDocument();

      rerender(<LabStatusBadge status="HIGH" />);
      expect(screen.getByText(/HIGH/i)).toBeInTheDocument();

      rerender(<LabStatusBadge status="NOT_DETERMINABLE" />);
      expect(screen.getByText(/NOT DETERMINABLE/i)).toBeInTheDocument();
    });

    it('renders VerificationBadge variants correctly', () => {
      const { rerender } = render(<VerificationBadge status="PATIENT_CONFIRMED" />);
      expect(screen.getByText(/Patient Confirmed/i)).toBeInTheDocument();

      rerender(<VerificationBadge status="DOCTOR_VERIFIED" verifiedBy="Dr. A. Deshmukh" />);
      expect(screen.getByText(/Doctor Verified/i)).toBeInTheDocument();

      rerender(<VerificationBadge status="UNVERIFIED" />);
      expect(screen.getByText(/Needs Verification/i)).toBeInTheDocument();

      rerender(<VerificationBadge status="REJECTED" />);
      expect(screen.getByText(/Rejected/i)).toBeInTheDocument();
    });

    it('renders SourceBadge variants correctly', () => {
      const { rerender } = render(<SourceBadge sourceType="USER_PROVIDED" />);
      expect(screen.getByText(/User Provided/i)).toBeInTheDocument();

      rerender(<SourceBadge sourceType="REPORT_EXTRACTED" />);
      expect(screen.getByText(/Extracted from Report/i)).toBeInTheDocument();

      rerender(<SourceBadge sourceType="AI_GENERATED" />);
      expect(screen.getByText(/AI Summary/i)).toBeInTheDocument();
    });
  });

  describe('LabResultsTable Component', () => {
    const mockResults: ExtractedLabResult[] = [
      {
        id: 'lab-1',
        patientId: 'p-1',
        sourceReportId: 'rep-1',
        sourceReportName: 'CBC Profile',
        testName: 'Hemoglobin',
        value: '11.4',
        unit: 'g/dL',
        referenceRange: '13.0 - 17.0',
        status: 'LOW',
        confidence: 0.95,
        confidenceLevel: 'HIGH',
        sourceType: 'REPORT_EXTRACTED',
        verificationStatus: 'PATIENT_CONFIRMED',
        reportDate: '2026-09-05'
      }
    ];

    it('renders structured lab parameters and doctor verify button', () => {
      const handleVerification = vi.fn().mockResolvedValue(undefined);
      render(
        <LabResultsTable
          labResults={mockResults}
          onUpdateVerification={handleVerification}
        />
      );

      expect(screen.getByText('Hemoglobin')).toBeInTheDocument();
      expect(screen.getByText('11.4')).toBeInTheDocument();
      expect(screen.getByText(/13.0 - 17.0/)).toBeInTheDocument();

      // Click Confirm/Verify button
      const verifyBtn = screen.getByRole('button', { name: /Confirm/i });
      fireEvent.click(verifyBtn);

      expect(handleVerification).toHaveBeenCalledWith('lab-1', 'CONFIRMED');
    });
  });
});
