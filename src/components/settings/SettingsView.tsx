import { useState } from 'react';
import { PatientStorageService } from '../../services/storage';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Building2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface SettingsViewProps {
  onDataChanged: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onDataChanged }) => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [hospitalName, setHospitalName] = useState('Apollo Health City & Medical Center');
  const [branchCode, setBranchCode] = useState('BLR-APL-OPD-04');
  const [department, setDepartment] = useState('General Medicine & Diagnostics OPD');

  const handleExportJSON = () => {
    try {
      const dataStr = PatientStorageService.exportJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medlens_patient_records_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setFeedback({ type: 'success', message: 'Patient database exported successfully as JSON.' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to export data: ' + (err as Error).message });
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = PatientStorageService.importJSON(content);
      if (res.success) {
        onDataChanged();
        setFeedback({ type: 'success', message: `Successfully restored ${res.count} patient records from backup.` });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Import failed.' });
      }
    };
    reader.readAsText(file);
  };

  const handleResetSample = () => {
    if (window.confirm('Reset patient records to realistic Indian hospital sample data? Any recent custom entries will be replaced.')) {
      PatientStorageService.resetToSampleData();
      onDataChanged();
      setFeedback({ type: 'success', message: 'Database reset to default Indian hospital patient cases.' });
    }
  };

  const handleClearAll = () => {
    if (window.confirm('WARNING: Are you sure you want to clear all patient records? This allows testing the empty states.')) {
      PatientStorageService.clearAllData();
      onDataChanged();
      setFeedback({ type: 'success', message: 'All patient records cleared. You can now test the application empty states.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 className="section-title">System Settings & Data Management</h1>
        <p className="section-subtitle">
          Facility information, local persistence, backup and data restoration
        </p>
      </div>

      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: feedback.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
            border: `1px solid ${feedback.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
            color: feedback.type === 'success' ? 'var(--success)' : 'var(--danger)'
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Hospital Facility Profile */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Building2 size={18} color="var(--primary)" />
              Healthcare Facility Configuration
            </h2>
            <p className="card-subtitle">Hospital metadata stamped onto exported clinical records</p>
          </div>
        </div>

        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="hospitalName">Hospital / Clinic Name</label>
              <input
                id="hospitalName"
                type="text"
                className="form-input"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="branchCode">Branch / Unit Code</label>
              <input
                id="branchCode"
                type="text"
                className="form-input font-mono"
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
              />
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label" htmlFor="department">Active Department / Desk</label>
              <input
                id="department"
                type="text"
                className="form-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Storage & Backup */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Database size={18} color="var(--primary)" />
              Data Persistence & Migration
            </h2>
            <p className="card-subtitle">Local storage records, JSON exports, and demo testing data</p>
          </div>
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Export & Import Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Export Records (JSON)</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                Download a JSON backup of all registered patients, symptoms, allergies, medications, and timeline logs.
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportJSON}
            >
              <Download size={14} />
              <span>Download Backup</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Import / Restore Database</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                Upload a valid MedLens JSON export file to restore or load existing hospital records.
              </div>
            </div>
            <div>
              <input
                type="file"
                id="import-backup-file"
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleImportJSON}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => document.getElementById('import-backup-file')?.click()}
              >
                <Upload size={14} />
                <span>Upload JSON</span>
              </button>
            </div>
          </div>

          {/* Reset to Sample Data */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Reset to Sample Indian Hospital Cases</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                Populate standard patient profiles (diabetes, migraine, osteoarthritis, anemia with symptoms, reports, and timeline events).
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetSample}
            >
              <RotateCcw size={14} />
              <span>Load Sample Data</span>
            </button>
          </div>

          {/* Clear All Data */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--danger)' }}>Clear All Records (Test Empty State)</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                Wipe all records to verify zero-state screens and error fallbacks.
              </div>
            </div>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleClearAll}
            >
              <Trash2 size={14} />
              <span>Wipe Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Notice Card */}
      <div className="card" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <ShieldAlert size={22} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>
              Phase 1 Medical Architecture Compliance Notice
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#1e3a8a', lineHeight: 1.6 }}>
              MedLens Phase 1 strictly implements information collection, structured data modeling, and organized display. It does not provide automatic medical diagnosis, drug dosing alterations, or automated prescriptions. All manually entered information is attributed to healthcare staff with <code>sourceType: "USER_PROVIDED"</code> for future Phase 2 verification.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
