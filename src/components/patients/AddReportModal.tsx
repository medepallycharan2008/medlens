import { useState } from 'react';
import type { MedicalReport, ReportStatus } from '../../types/patient';
import { X, Upload, FileText, Check } from 'lucide-react';

interface AddReportModalProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSaveReport: (reportData: Omit<MedicalReport, 'reportId' | 'patientId' | 'sourceType'>) => Promise<any>;
}

export const AddReportModal: React.FC<AddReportModalProps> = ({
  patientName,
  onClose,
  onSaveReport
}) => {
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('Radiology');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ReportStatus>('UPLOADED');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.2 MB');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMb} MB`);
      if (!reportName) {
        // Prepopulate report name from file name without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setReportName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportName.trim()) {
      setError('Please provide a report title or name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSaveReport({
        reportName: reportName.trim(),
        reportType,
        uploadDate: new Date().toISOString(),
        reportDate,
        fileReference: fileName || `${reportName.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        fileSize: fileName ? fileSize : '850 KB',
        status,
        notes: notes.trim()
      });
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to save medical report.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Upload size={18} color="var(--primary)" />
              Attach Medical Report
            </h2>
            <p className="card-subtitle">Adding diagnostic report for {patientName}</p>
          </div>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                {error}
              </div>
            )}

            {/* File Upload Zone */}
            <div
              style={{
                border: '2px dashed var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-subtle)',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('report-file-input')?.click()}
            >
              <input
                id="report-file-input"
                type="file"
                style={{ display: 'none' }}
                accept=".pdf,.png,.jpg,.jpeg,.dcm"
                onChange={handleFileChange}
              />
              <FileText size={32} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                {fileName ? fileName : 'Click to select or upload report file'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                {fileName ? `File size: ${fileSize}` : 'Supports PDF, JPEG, PNG, or DICOM scans'}
              </div>
            </div>

            {/* Report Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reportName">
                Report Title / Investigation Name <span className="form-required">*</span>
              </label>
              <input
                id="reportName"
                type="text"
                className="form-input"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="e.g. Chest X-Ray PA View, Fasting Blood Sugar, MRI Spine"
                required
              />
            </div>

            <div className="form-grid">
              {/* Report Type */}
              <div className="form-group">
                <label className="form-label" htmlFor="reportType">Investigation Department</label>
                <select
                  id="reportType"
                  className="form-select"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="Radiology">Radiology (X-Ray / CT / MRI)</option>
                  <option value="Pathology / Biochemistry">Pathology & Biochemistry (Blood / Urine)</option>
                  <option value="Cardiology">Cardiology (ECG / Echo / TMT)</option>
                  <option value="Endoscopy">Gastroenterology / Endoscopy</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                  <option value="Other">Other Clinical Document</option>
                </select>
              </div>

              {/* Report Date */}
              <div className="form-group">
                <label className="form-label" htmlFor="reportDate">Test / Report Date</label>
                <input
                  id="reportDate"
                  type="date"
                  className="form-input"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label" htmlFor="reportStatus">Report Status</label>
              <select
                id="reportStatus"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ReportStatus)}
              >
                <option value="UPLOADED">Uploaded (Awaiting clinical review)</option>
                <option value="PROCESSED">Processed (Verified by attending staff)</option>
                <option value="PENDING">Pending (Sample collected / scan in progress)</option>
              </select>
            </div>

            {/* Notes / Impression */}
            <div className="form-group">
              <label className="form-label" htmlFor="reportNotes">Clinical Impression / Findings</label>
              <textarea
                id="reportNotes"
                className="form-textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bilateral clear lung fields, no focal consolidation. Hb 12.4 g/dL."
              />
            </div>
          </div>

          <div className="card-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Check size={16} />
              <span>{isSubmitting ? 'Attaching...' : 'Save & Attach Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
