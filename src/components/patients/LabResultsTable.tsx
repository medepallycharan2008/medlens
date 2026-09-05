import { useState } from 'react';
import type { ExtractedLabResult, VerificationStatus, LabResultStatus } from '../../types/patient';
import { LabStatusBadge, VerificationBadge, SourceBadge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import {
  Activity,
  Search,
  Filter,
  Check,
  Edit3,
  XCircle
} from 'lucide-react';

interface LabResultsTableProps {
  labResults: ExtractedLabResult[];
  onOpenReport?: (reportId: string) => void;
  onUpdateVerification: (
    resultId: string,
    verificationStatus: VerificationStatus,
    updatedResult?: ExtractedLabResult
  ) => Promise<any>;
}

export const LabResultsTable: React.FC<LabResultsTableProps> = ({
  labResults,
  onOpenReport,
  onUpdateVerification
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LabResultStatus | 'ALL'>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<VerificationStatus | 'ALL'>('ALL');
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editRange, setEditRange] = useState('');

  // Filter results
  const filteredResults = labResults.filter(item => {
    // Exclude rejected unless explicitly filtering by REJECTED or ALL
    if (verificationFilter !== 'REJECTED' && item.verificationStatus === 'REJECTED') {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.testName.toLowerCase().includes(q);
      const matchReport = item.sourceReportName.toLowerCase().includes(q);
      const matchValue = item.value.toLowerCase().includes(q);
      if (!matchName && !matchReport && !matchValue) return false;
    }

    if (statusFilter !== 'ALL' && item.status !== statusFilter) {
      return false;
    }

    if (verificationFilter !== 'ALL' && item.verificationStatus !== verificationFilter) {
      return false;
    }

    return true;
  });

  const handleStartEdit = (item: ExtractedLabResult) => {
    setEditingResultId(item.id);
    setEditValue(item.value);
    setEditRange(item.referenceRange || '');
  };

  const handleSaveEdit = async (item: ExtractedLabResult) => {
    await onUpdateVerification(item.id, 'EDITED', {
      ...item,
      value: editValue.trim(),
      referenceRange: editRange.trim() ? editRange.trim() : null
    });
    setEditingResultId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Filter Controls */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--primary)" />
                Structured Laboratory Measurements ({labResults.length})
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                Values evaluated strictly against source report biological intervals
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
              <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                {labResults.filter(r => r.status === 'LOW').length} Low
              </span>
              <span className="badge badge-success">
                {labResults.filter(r => r.status === 'NORMAL').length} Normal
              </span>
              <span className="badge badge-severe">
                {labResults.filter(r => r.status === 'HIGH').length} High
              </span>
              <span className="badge badge-neutral">
                {labResults.filter(r => r.status === 'NOT_DETERMINABLE').length} Not Determinable
              </span>
            </div>
          </div>

          {/* Search and Filters bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <div className="search-container" style={{ gridColumn: 'span 2' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                style={{ minHeight: '36px', padding: '6px 12px 6px 36px', fontSize: '0.8125rem' }}
                placeholder="Search test name, value, or report..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="var(--text-subtle)" />
              <select
                className="form-select"
                style={{ minHeight: '36px', padding: '6px 10px', fontSize: '0.8125rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as LabResultStatus | 'ALL')}
                aria-label="Filter by Status"
              >
                <option value="ALL">All Statuses</option>
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="NOT_DETERMINABLE">Not Determinable (No Ref Range)</option>
              </select>
            </div>

            <div>
              <select
                className="form-select"
                style={{ minHeight: '36px', padding: '6px 10px', fontSize: '0.8125rem' }}
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value as VerificationStatus | 'ALL')}
                aria-label="Filter by Verification"
              >
                <option value="ALL">All Verifications</option>
                <option value="CONFIRMED">Human Verified</option>
                <option value="UNVERIFIED">Needs Verification</option>
                <option value="EDITED">Staff Edited</option>
                <option value="REJECTED">Rejected Items</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table of Results */}
      {filteredResults.length === 0 ? (
        labResults.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No Laboratory Results Attached"
            description="Upload a pathology or diagnostic report to extract, structure, and verify clinical measurements."
          />
        ) : (
          <EmptyState
            icon={Search}
            title="No Matching Lab Tests"
            description={`No tests match the current filter criteria ("${searchQuery || statusFilter}"). Try adjusting filters.`}
            actionText="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setVerificationFilter('ALL');
            }}
          />
        )
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Source Reference Range</th>
                  <th>Evaluation</th>
                  <th>Report Date / Source</th>
                  <th>Provenance</th>
                  <th>Verification</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((item) => {
                  const isEditing = editingResultId === item.id;

                  return (
                    <tr key={item.id}>
                      {/* Test Name */}
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{item.testName}</strong>
                        {item.statusReason && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                            {item.statusReason}
                          </div>
                        )}
                      </td>

                      {/* Value */}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-input"
                            style={{ minHeight: '30px', padding: '2px 6px', fontSize: '0.8125rem', width: '80px' }}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                          />
                        ) : (
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.9375rem' }}>
                            {item.value}
                          </span>
                        )}
                      </td>

                      {/* Unit */}
                      <td style={{ color: 'var(--text-muted)' }}>{item.unit || '—'}</td>

                      {/* Source Reference Range (RULE #4 CHECK) */}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-input"
                            style={{ minHeight: '30px', padding: '2px 6px', fontSize: '0.8125rem', width: '110px' }}
                            value={editRange}
                            onChange={(e) => setEditRange(e.target.value)}
                            placeholder="e.g. 13 - 17"
                          />
                        ) : item.referenceRange ? (
                          <span style={{ fontWeight: 600 }}>{item.referenceRange} {item.unit}</span>
                        ) : (
                          <span style={{ color: 'var(--text-subtle)', fontStyle: 'italic', fontSize: '0.75rem' }} title="Strictly non-inferred">
                            Not provided in source report
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td>
                        <LabStatusBadge status={item.status} />
                      </td>

                      {/* Report & Date */}
                      <td>
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: onOpenReport ? 'var(--primary)' : 'var(--text-main)',
                            cursor: onOpenReport ? 'pointer' : 'default',
                            textDecoration: onOpenReport ? 'underline' : 'none'
                          }}
                          onClick={() => onOpenReport && onOpenReport(item.sourceReportId)}
                          title={onOpenReport ? 'Open source report in Two-Panel Viewer' : undefined}
                        >
                          {item.sourceReportName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          {item.reportDate}
                        </div>
                      </td>

                      {/* Provenance Badge */}
                      <td>
                        <SourceBadge sourceType="REPORT_EXTRACTED" />
                      </td>

                      {/* Verification Status */}
                      <td>
                        <VerificationBadge status={item.verificationStatus} verifiedBy={item.verifiedBy} />
                      </td>

                      {/* Action buttons */}
                      <td style={{ textAlign: 'right' }}>
                        {isEditing ? (
                          <div style={{ display: 'inline-flex', gap: '4px' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                              onClick={() => setEditingResultId(null)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                              onClick={() => handleSaveEdit(item)}
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {item.verificationStatus !== 'CONFIRMED' && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                onClick={() => onUpdateVerification(item.id, 'CONFIRMED')}
                                title="Confirm result as Human Verified"
                              >
                                <Check size={12} />
                                <span>Confirm</span>
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => handleStartEdit(item)}
                              title="Edit test value or range"
                            >
                              <Edit3 size={12} />
                            </button>
                            {item.verificationStatus !== 'REJECTED' && (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                onClick={() => onUpdateVerification(item.id, 'REJECTED')}
                                title="Reject result"
                              >
                                <XCircle size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
