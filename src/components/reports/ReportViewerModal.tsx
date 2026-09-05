import { useState } from 'react';
import type { MedicalReport, ExtractedLabResult, VerificationStatus } from '../../types/patient';
import { LabStatusBadge, VerificationBadge, ConfidenceBadge, SourceBadge } from '../common/Badge';
import { VerificationService } from '../../services/verificationService';
import {
  X,
  FileText,
  Check,
  Edit3,
  XCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Building2,
  Info
} from 'lucide-react';

interface ReportViewerModalProps {
  report: MedicalReport;
  patientName: string;
  onClose: () => void;
  onUpdateVerification: (
    resultId: string,
    verificationStatus: VerificationStatus,
    updatedResult?: ExtractedLabResult
  ) => Promise<any>;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  report,
  patientName,
  onClose,
  onUpdateVerification
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ value: string; unit: string; referenceRange: string }>({
    value: '',
    unit: '',
    referenceRange: ''
  });
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const results = report.extractedData?.results || [];

  const handleConfirm = async (result: ExtractedLabResult) => {
    const updated = VerificationService.confirmResult(result);
    await onUpdateVerification(result.id, 'CONFIRMED', updated);
    setActionFeedback(`Confirmed "${result.testName}" as Human Verified.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleReject = async (result: ExtractedLabResult) => {
    if (window.confirm(`Reject extracted test "${result.testName}"? It will be marked as rejected in the audit record.`)) {
      const updated = VerificationService.rejectResult(result);
      await onUpdateVerification(result.id, 'REJECTED', updated);
      setActionFeedback(`Rejected "${result.testName}".`);
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleStartEdit = (result: ExtractedLabResult) => {
    setEditingResultId(result.id);
    setEditForm({
      value: result.value,
      unit: result.unit,
      referenceRange: result.referenceRange || ''
    });
  };

  const handleSaveEdit = async (result: ExtractedLabResult) => {
    const updated = VerificationService.editResult({
      result,
      newValue: editForm.value,
      newUnit: editForm.unit,
      newReferenceRange: editForm.referenceRange.trim() ? editForm.referenceRange.trim() : null
    });

    await onUpdateVerification(result.id, 'EDITED', updated);
    setEditingResultId(null);
    setActionFeedback(`Updated and verified "${result.testName}".`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-dialog report-viewer-dialog"
        style={{
          width: '95vw',
          maxWidth: '1280px',
          height: '92vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Viewer Header */}
        <div className="card-header" style={{ flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span className="badge badge-source">{report.reportType}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                Patient: <strong>{patientName}</strong>
              </span>
            </div>
            <h2 className="card-title" style={{ fontSize: '1.25rem' }}>
              <FileText size={20} color="var(--primary)" />
              {report.reportName}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
              Uploaded: {new Date(report.uploadDate).toLocaleDateString('en-IN')} &bull; {report.fileSize || 'PDF'}
            </div>
            <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close viewer">
              <X size={20} />
            </button>
          </div>
        </div>

        {actionFeedback && (
          <div style={{ backgroundColor: '#f0fdf4', borderBottom: '1px solid #bbf7d0', color: '#166534', padding: '8px 24px', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={14} />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Two-Panel Layout Area */}
        <div className="report-two-panel" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden', backgroundColor: 'var(--bg-app)' }}>
          {/* LEFT PANEL: Original Uploaded Source Document */}
          <div
            className="report-left-panel"
            style={{
              borderRight: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#f1f5f9',
              overflow: 'hidden'
            }}
          >
            {/* Document Controls toolbar */}
            <div style={{ padding: '8px 16px', backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
                <Building2 size={14} color="var(--primary)" />
                <span>Original Source Document</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-icon btn-sm"
                  onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  className="btn btn-icon btn-sm"
                  onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.15))}
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-icon btn-sm"
                  onClick={() => setZoomLevel(1)}
                  title="Reset Zoom"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            {/* Document Render Canvas */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '24px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease',
                  maxWidth: '560px',
                  width: '100%',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff'
                }}
              >
                {report.fileDataUrl ? (
                  <img
                    src={report.fileDataUrl}
                    alt="Original Uploaded Medical Document"
                    style={{ width: '100%', display: 'block', borderRadius: '4px' }}
                  />
                ) : (
                  <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-subtle)' }}>
                    <FileText size={48} color="var(--text-light)" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                      {report.fileReference || 'Report Document'}
                    </div>
                    <div style={{ fontSize: '0.8125rem' }}>
                      Diagnostic document preview initialized ({report.reportType})
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Structured Extracted Information & Human Verification */}
          <div
            className="report-right-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--bg-surface)',
              overflow: 'hidden'
            }}
          >
            {/* Subheader */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fafbfc' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Structured Extracted Parameters ({results.length})
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                  Verify extracted values and source reference intervals
                </div>
              </div>

              <SourceBadge sourceType="REPORT_EXTRACTED" />
            </div>

            {/* Structured Results List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-subtle)' }}>
                  <Info size={32} color="var(--text-light)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600 }}>No Structured Test Items Extracted</div>
                  <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>
                    This report does not contain recognized numeric laboratory measurements.
                  </p>
                </div>
              ) : (
                results.map((item) => {
                  const isEditingThis = editingResultId === item.id;

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        backgroundColor: item.verificationStatus === 'CONFIRMED' ? '#fafdfb' : item.verificationStatus === 'REJECTED' ? '#fff9f9' : 'var(--bg-surface)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {/* Top row: Test Name, Status, and Confidence */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                            {item.testName}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <LabStatusBadge status={item.status} />
                          <ConfidenceBadge confidence={item.confidence} level={item.confidenceLevel} />
                        </div>
                      </div>

                      {/* Values & Range (View mode vs Edit mode) */}
                      {!isEditingThis ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', backgroundColor: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Extracted Value</div>
                            <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                              {item.value} <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{item.unit}</span>
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Source Reference Range</div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: item.referenceRange ? 'var(--text-main)' : 'var(--danger)' }}>
                              {item.referenceRange ? (
                                `${item.referenceRange} ${item.unit}`
                              ) : (
                                <span style={{ fontStyle: 'italic' }}>Not provided in report</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Status Evaluation</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {item.statusReason}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Inline Edit Form */
                        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '12px', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#92400e' }}>
                            Edit Extracted Values:
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Value</label>
                              <input
                                type="text"
                                className="form-input"
                                style={{ minHeight: '34px', fontSize: '0.8125rem' }}
                                value={editForm.value}
                                onChange={(e) => setEditForm(prev => ({ ...prev, value: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Unit</label>
                              <input
                                type="text"
                                className="form-input"
                                style={{ minHeight: '34px', fontSize: '0.8125rem' }}
                                value={editForm.unit}
                                onChange={(e) => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Source Range</label>
                              <input
                                type="text"
                                className="form-input"
                                style={{ minHeight: '34px', fontSize: '0.8125rem' }}
                                value={editForm.referenceRange}
                                onChange={(e) => setEditForm(prev => ({ ...prev, referenceRange: e.target.value }))}
                                placeholder="e.g. 13.0 - 17.0"
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditingResultId(null)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSaveEdit(item)}
                            >
                              Save & Re-evaluate
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Verification Toolbar: [Confirm] [Edit] [Reject] */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '8px', marginTop: '2px' }}>
                        <VerificationBadge status={item.verificationStatus} verifiedBy={item.verifiedBy} />

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleStartEdit(item)}
                            title="Edit value or source range"
                          >
                            <Edit3 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleReject(item)}
                            title="Reject inaccurate extraction"
                          >
                            <XCircle size={12} />
                            <span>Reject</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleConfirm(item)}
                            title="Confirm as Human Verified"
                          >
                            <Check size={12} />
                            <span>Confirm</span>
                          </button>
                        </div>
                      </div>

                      {/* Audit History note if edited */}
                      {item.originalExtraction && item.verificationStatus === 'EDITED' && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', fontStyle: 'italic', borderTop: '1px dashed var(--border-light)', paddingTop: '4px' }}>
                          Original AI Extraction: "{item.originalExtraction.value} {item.originalExtraction.unit}" (Source Range: {item.originalExtraction.referenceRange || 'None'})
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
