import type {
  AllergySeverity,
  ReportStatus,
  SourceType,
  LabResultStatus,
  VerificationStatus,
  ConfidenceLevel
} from '../../types/patient';
import {
  UserCheck,
  FileText,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowDown,
  ArrowUp,
  Check,
  HelpCircle,
  ShieldCheck,
  Edit3,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface SeverityBadgeProps {
  severity: AllergySeverity;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const getBadgeClass = () => {
    switch (severity) {
      case 'mild':
        return 'badge-mild';
      case 'moderate':
        return 'badge-moderate';
      case 'severe':
        return 'badge-severe';
      case 'life-threatening':
        return 'badge-life-threatening';
      default:
        return 'badge-neutral';
    }
  };

  const label = severity.charAt(0).toUpperCase() + severity.slice(1).replace('-', ' ');

  return (
    <span className={`badge ${getBadgeClass()}`}>
      {(severity === 'severe' || severity === 'life-threatening') && (
        <AlertTriangle size={12} />
      )}
      {label}
    </span>
  );
};

interface SourceBadgeProps {
  sourceType: SourceType;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ sourceType }) => {
  if (sourceType === 'USER_PROVIDED') {
    return (
      <span className="badge badge-source" title="Entered directly by healthcare personnel">
        <UserCheck size={11} />
        User Provided
      </span>
    );
  }

  if (sourceType === 'REPORT_EXTRACTED') {
    return (
      <span className="badge" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe' }} title="Extracted from source laboratory report">
        <FileText size={11} />
        Extracted from Report
      </span>
    );
  }

  return (
    <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }} title="Synthesized by AI analysis engine">
      <Bot size={11} />
      AI Summary
    </span>
  );
};

interface StatusBadgeProps {
  status: ReportStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'PROCESSED':
      return (
        <span className="badge badge-success">
          <CheckCircle2 size={11} />
          Processed
        </span>
      );
    case 'NEEDS_REVIEW':
      return (
        <span className="badge badge-moderate">
          <AlertCircle size={11} />
          Needs Review
        </span>
      );
    case 'PROCESSING':
      return (
        <span className="badge badge-source">
          <Clock size={11} className="spin-slow" />
          Processing
        </span>
      );
    case 'FAILED':
      return (
        <span className="badge badge-severe">
          <XCircle size={11} />
          Failed
        </span>
      );
    case 'UPLOADED':
    default:
      return (
        <span className="badge badge-source">
          <FileText size={11} />
          Uploaded
        </span>
      );
  }
};

interface LabStatusBadgeProps {
  status: LabResultStatus;
}

export const LabStatusBadge: React.FC<LabStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'LOW':
      return (
        <span
          className="badge"
          style={{
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            fontWeight: 700
          }}
          title="Below source reference range"
        >
          <ArrowDown size={12} strokeWidth={2.5} />
          LOW
        </span>
      );
    case 'HIGH':
      return (
        <span
          className="badge badge-severe"
          title="Above source reference range"
        >
          <ArrowUp size={12} strokeWidth={2.5} />
          HIGH
        </span>
      );
    case 'NORMAL':
      return (
        <span
          className="badge badge-success"
          title="Within source reference range"
        >
          <Check size={12} strokeWidth={2.5} />
          NORMAL
        </span>
      );
    case 'NOT_DETERMINABLE':
    default:
      return (
        <span
          className="badge badge-neutral"
          style={{
            backgroundColor: '#f8fafc',
            color: '#64748b',
            border: '1px dashed #cbd5e1',
            fontStyle: 'italic'
          }}
          title="Reference range not provided in source report. Status cannot be determined."
        >
          <HelpCircle size={12} />
          NOT DETERMINABLE
        </span>
      );
  }
};

interface VerificationBadgeProps {
  status: VerificationStatus;
  verifiedBy?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status, verifiedBy }) => {
  switch (status) {
    case 'PATIENT_CONFIRMED':
      return (
        <span
          className="badge"
          style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}
          title="Reviewed and confirmed by patient"
        >
          <Check size={12} />
          Patient Confirmed
        </span>
      );
    case 'DOCTOR_VERIFIED':
    case 'CONFIRMED':
      return (
        <span
          className="badge badge-success"
          title={verifiedBy ? `Verified by ${verifiedBy}` : 'Verified by attending doctor'}
        >
          <ShieldCheck size={12} />
          Doctor Verified
        </span>
      );
    case 'EDITED':
      return (
        <span
          className="badge"
          style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
          title={verifiedBy ? `Edited and verified by ${verifiedBy}` : 'Edited by clinical staff'}
        >
          <Edit3 size={12} />
          Staff Edited
        </span>
      );
    case 'REJECTED':
      return (
        <span
          className="badge badge-severe"
          title="Rejected during clinical review"
        >
          <XCircle size={12} />
          Rejected
        </span>
      );
    case 'UNVERIFIED':
    default:
      return (
        <span
          className="badge badge-mild"
          title="Pending human confirmation"
        >
          <Clock size={12} />
          Needs Verification
        </span>
      );
  }
};

interface ConfidenceBadgeProps {
  confidence: number;
  level: ConfidenceLevel;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, level }) => {
  const pct = Math.round(confidence * 100);
  if (level === 'HIGH') {
    return (
      <span
        className="badge"
        style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontSize: '0.7rem' }}
        title={`Optical confidence: ${pct}%`}
      >
        High Confidence ({pct}%)
      </span>
    );
  }

  return (
    <span
      className="badge"
      style={{ backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', fontSize: '0.7rem' }}
      title={`Optical confidence: ${pct}% - Verification recommended`}
    >
      <AlertTriangle size={10} />
      Needs Verification ({pct}%)
    </span>
  );
};
