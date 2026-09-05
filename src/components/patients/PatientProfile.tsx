import { useState } from 'react';
import type {
  Patient,
  MedicalReport,
  ExtractedLabResult,
  ExtractedReportData,
  VerificationStatus
} from '../../types/patient';
import { SeverityBadge, SourceBadge, StatusBadge } from '../common/Badge';
import { AddReportModal } from './AddReportModal';
import { AddNoteModal } from './AddNoteModal';
import { ReportUploadModal } from '../reports/ReportUploadModal';
import { ReportViewerModal } from '../reports/ReportViewerModal';
import { LabResultsTable } from './LabResultsTable';
import { AISummaryCard } from '../summary/AISummaryCard';
import type { NavTab } from '../layout/Sidebar';
import { EmptyState } from '../common/EmptyState';
import {
  User,
  Activity,
  AlertTriangle,
  Pill,
  History,
  FileText,
  Clock,
  Edit2,
  Check,
  Plus,
  Phone,
  Mail,
  MapPin,
  HeartHandshake,
  Calendar,
  FolderOpen,
  Sparkles,
  Columns,
  Bot
} from 'lucide-react';

interface PatientProfileProps {
  patient: Patient | null;
  onEditPatient: (patient: Patient) => void;
  onAddReport: (patientId: string, reportData: Omit<MedicalReport, 'reportId' | 'patientId' | 'sourceType'>) => Promise<any>;
  onAddExtractedReport: (
    patientId: string,
    reportData: Omit<MedicalReport, 'reportId' | 'patientId' | 'sourceType'>,
    extractedData: ExtractedReportData
  ) => Promise<any>;
  onUpdateVerification: (
    resultId: string,
    verificationStatus: VerificationStatus,
    updatedResult?: ExtractedLabResult
  ) => Promise<any>;
  onGenerateSummary: (patientId: string) => Promise<any>;
  onAddNote: (patientId: string, title: string, description: string) => Promise<any>;
  setActiveTab: (tab: NavTab) => void;
}

export const PatientProfile: React.FC<PatientProfileProps> = ({
  patient,
  onEditPatient,
  onAddReport,
  onAddExtractedReport,
  onUpdateVerification,
  onGenerateSummary,
  onAddNote,
  setActiveTab
}) => {
  const [showManualReportModal, setShowManualReportModal] = useState(false);
  const [showAiUploadModal, setShowAiUploadModal] = useState(false);
  const [viewingReport, setViewingReport] = useState<MedicalReport | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<
    'all' | 'clinical' | 'allergies_meds' | 'reports' | 'lab_results' | 'ai_summary' | 'timeline'
  >('all');

  if (!patient) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No Patient Selected"
        description="Select a patient from the directory or register a new patient to view their comprehensive structured record."
        actionText="Browse Patient Directory"
        onAction={() => setActiveTab('patients')}
        secondaryActionText="+ Register New Patient"
        onSecondaryAction={() => setActiveTab('add_patient')}
      />
    );
  }

  const createdDate = new Date(patient.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const updatedDate = new Date(patient.updatedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Sort timeline chronologically descending
  const sortedTimeline = [...(patient.timeline || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const labResults = patient.labResults || [];
  const abnormalLabCount = labResults.filter(r => r.status === 'LOW' || r.status === 'HIGH').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Patient Header Card & Demographics */}
      <div className="card">
        <div className="card-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <span className="patient-id-tag" style={{ fontSize: '0.875rem', padding: '3px 8px' }}>
                {patient.patientId}
              </span>
              <span className="badge badge-neutral">
                {patient.sex} &bull; {patient.age} Years
              </span>
              {patient.dateOfBirth && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                  DOB: {patient.dateOfBirth}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {patient.name}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowNoteModal(true)}
              id="btn-add-profile-note"
            >
              <Plus size={14} />
              <span>Add Note</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAiUploadModal(true)}
              id="btn-profile-ai-upload"
              style={{ borderColor: '#99f6e4', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}
            >
              <Sparkles size={14} />
              <span>Upload Medical Report</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                onEditPatient(patient);
                setActiveTab('add_patient');
              }}
              id="btn-edit-patient"
            >
              <Edit2 size={14} />
              <span>Edit Patient</span>
            </button>
          </div>
        </div>

        <div className="card-body" style={{ backgroundColor: '#fafbfc' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.875rem' }}>
            {/* Phone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone size={16} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Primary Phone</div>
                <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{patient.phone || 'None'}</div>
              </div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={16} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Email Address</div>
                <div style={{ fontWeight: 500 }}>{patient.email || 'Not provided'}</div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HeartHandshake size={16} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Emergency Contact</div>
                <div style={{ fontWeight: 600 }}>
                  {patient.emergencyContact?.name ? (
                    `${patient.emergencyContact.name} (${patient.emergencyContact.relation || 'Contact'}) - ${patient.emergencyContact.phone}`
                  ) : (
                    'Not specified'
                  )}
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Record Activity</div>
                <div style={{ fontSize: '0.8125rem' }}>
                  Registered: {createdDate}<br />
                  Updated: {updatedDate}
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          {patient.address && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <MapPin size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{patient.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs for Profile Subsections */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px', overflowX: 'auto' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('all')}
        >
          All Sections
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'lab_results' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('lab_results')}
          id="tab-lab-results"
        >
          <Activity size={14} />
          <span>Laboratory Results ({labResults.length})</span>
          {abnormalLabCount > 0 && (
            <span className="nav-badge" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
              {abnormalLabCount} Notable
            </span>
          )}
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'ai_summary' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('ai_summary')}
          id="tab-ai-summary"
        >
          <Bot size={14} />
          <span>AI Patient Summary</span>
          {patient.aiSummary && (
            <span className="nav-badge" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>Ready</span>
          )}
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('reports')}
          id="tab-reports"
        >
          <FileText size={14} />
          <span>Reports ({patient.reports?.length || 0})</span>
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'clinical' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('clinical')}
        >
          <Activity size={14} />
          <span>Symptoms & History</span>
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'allergies_meds' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('allergies_meds')}
        >
          <Pill size={14} />
          <span>Allergies & Medications</span>
          {patient.allergies?.length > 0 && (
            <span className="nav-badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>{patient.allergies.length}</span>
          )}
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'timeline' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('timeline')}
        >
          <Clock size={14} />
          <span>Timeline ({sortedTimeline.length})</span>
        </button>
      </div>

      {/* AI Patient-Friendly Summary Card */}
      {(activeSubTab === 'all' || activeSubTab === 'ai_summary') && (
        <AISummaryCard
          summary={patient.aiSummary}
          onGenerateSummary={() => onGenerateSummary(patient.id)}
        />
      )}

      {/* Structured Laboratory Results Table */}
      {(activeSubTab === 'all' || activeSubTab === 'lab_results') && (
        <LabResultsTable
          labResults={labResults}
          onOpenReport={(reportId) => {
            const r = patient.reports.find(rep => rep.reportId === reportId);
            if (r) setViewingReport(r);
          }}
          onUpdateVerification={(resultId, status, updated) =>
            onUpdateVerification(resultId, status, updated)
          }
        />
      )}

      {/* Chief Complaint Banner */}
      {(activeSubTab === 'all' || activeSubTab === 'clinical') && (
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="card-body" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Chief Complaint
              </div>
              <SourceBadge sourceType="USER_PROVIDED" />
            </div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 500, color: 'var(--text-main)' }}>
              {patient.chiefComplaint || 'No specific chief complaint recorded.'}
            </div>
          </div>
        </div>
      )}

      {/* 2. CRITICAL SAFETY: ALLERGIES HIGHLIGHT CARD */}
      {(activeSubTab === 'all' || activeSubTab === 'allergies_meds') && (
        <div
          className="card"
          style={{
            borderColor: patient.allergies && patient.allergies.length > 0 ? 'var(--danger-border)' : 'var(--border-light)',
            backgroundColor: patient.allergies && patient.allergies.length > 0 ? '#fffdfd' : 'var(--bg-surface)'
          }}
        >
          <div
            className="card-header"
            style={{
              backgroundColor: patient.allergies && patient.allergies.length > 0 ? '#fef2f2' : 'transparent',
              borderBottomColor: 'var(--danger-border)'
            }}
          >
            <div>
              <h2 className="card-title" style={{ color: patient.allergies && patient.allergies.length > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
                <AlertTriangle size={18} />
                Documented Allergies & Adverse Reactions
              </h2>
              <p className="card-subtitle">Critical clinical warning for prescribing staff</p>
            </div>
            <SourceBadge sourceType="USER_PROVIDED" />
          </div>

          <div className="card-body">
            {!patient.allergies || patient.allergies.length === 0 ? (
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
                No known drug or environmental allergies recorded.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {patient.allergies.map((alg) => (
                  <div
                    key={alg.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--danger-border)',
                      boxShadow: 'var(--shadow-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>{alg.allergen}</strong>
                      <SeverityBadge severity={alg.severity} />
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <strong>Reaction:</strong> {alg.reaction || 'Unspecified allergic reaction'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SYMPTOMS & PRESENTING COMPLAINTS */}
      {(activeSubTab === 'all' || activeSubTab === 'clinical') && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Activity size={18} color="var(--primary)" />
                Presenting Symptoms
              </h2>
              <p className="card-subtitle">Structured symptom logs with duration and observations</p>
            </div>
            <SourceBadge sourceType="USER_PROVIDED" />
          </div>

          <div className="card-body">
            {!patient.symptoms || patient.symptoms.length === 0 ? (
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
                No specific symptoms enumerated.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {patient.symptoms.map((sym) => (
                  <div
                    key={sym.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9375rem' }}>
                        {sym.symptom}
                      </div>
                      {sym.notes && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {sym.notes}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                        {sym.duration || 'Duration unstated'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. CURRENT MEDICATIONS */}
      {(activeSubTab === 'all' || activeSubTab === 'allergies_meds') && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Pill size={18} color="var(--primary)" />
                Current Medications
              </h2>
              <p className="card-subtitle">Documented pharmaceutical regimens</p>
            </div>
            <SourceBadge sourceType="USER_PROVIDED" />
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {!patient.medications || patient.medications.length === 0 ? (
              <div style={{ padding: '20px', color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
                No active medications reported.
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Frequency / Schedule</th>
                      <th>Duration</th>
                      <th>Instructions / Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.medications.map((med) => (
                      <tr key={med.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{med.name}</td>
                        <td>{med.frequency || 'As directed'}</td>
                        <td>
                          <span className="badge badge-neutral">{med.duration || 'Ongoing'}</span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          {med.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. MEDICAL HISTORY & COMORBIDITIES */}
      {(activeSubTab === 'all' || activeSubTab === 'clinical') && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <History size={18} color="var(--primary)" />
                Medical History & Comorbidities
              </h2>
              <p className="card-subtitle">Existing conditions, surgical history, and family background</p>
            </div>
            <SourceBadge sourceType="USER_PROVIDED" />
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>
                Diagnosed Medical Conditions
              </h3>
              {!patient.conditions || patient.conditions.length === 0 ? (
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
                  No chronic medical conditions listed.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {patient.conditions.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{c.condition}</div>
                        {c.notes && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{c.notes}</div>}
                      </div>
                      {c.diagnosedDate && (
                        <span className="badge badge-neutral">
                          Diagnosed: {c.diagnosedDate}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Previous Medical History
                </h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  {patient.previousHistory || 'No previous medical history recorded.'}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Previous Surgeries & Procedures
                </h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  {patient.previousSurgeries || 'No surgical history reported.'}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Family Medical History
                </h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  {patient.familyHistory || 'No family medical history documented.'}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Relevant Lifestyle Information
                </h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  {patient.lifestyleInfo || 'No lifestyle habits noted.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MEDICAL REPORTS SECTION WITH TWO-PANEL VIEWER TRIGGER */}
      {(activeSubTab === 'all' || activeSubTab === 'reports') && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <FileText size={18} color="var(--primary)" />
                Attached Medical Reports & Source Documents ({patient.reports?.length || 0})
              </h2>
              <p className="card-subtitle">Original files, OCR status, and extracted test archives</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowManualReportModal(true)}
              >
                + Manual Log
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowAiUploadModal(true)}
                id="btn-upload-ai-report"
              >
                <Sparkles size={14} />
                <span>Upload Medical Report (AI Pipeline)</span>
              </button>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {!patient.reports || patient.reports.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center' }}>
                <FileText size={36} color="var(--text-light)" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  No Medical Reports Uploaded
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)', marginBottom: '16px' }}>
                  Upload a PDF, JPG, or PNG report to extract structured tests with strict source reference ranges.
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAiUploadModal(true)}
                >
                  <Sparkles size={14} />
                  <span>Upload First Report (AI Pipeline)</span>
                </button>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Report Document</th>
                      <th>Department</th>
                      <th>Test Date</th>
                      <th>Upload Date</th>
                      <th>Processing Status</th>
                      <th>Structured Parameters</th>
                      <th style={{ textAlign: 'right' }}>Document View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.reports.map((rep) => {
                      const repUploadDate = new Date(rep.uploadDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      });

                      const extractedCount = rep.extractedData?.results?.length || 0;

                      return (
                        <tr key={rep.reportId}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{rep.reportName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                              {rep.fileReference || 'document.pdf'} {rep.fileSize ? `(${rep.fileSize})` : ''}
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-neutral">{rep.reportType}</span>
                          </td>
                          <td>{rep.reportDate || '—'}</td>
                          <td style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>{repUploadDate}</td>
                          <td>
                            <StatusBadge status={rep.status} />
                          </td>
                          <td>
                            {extractedCount > 0 ? (
                              <span className="badge badge-source" style={{ backgroundColor: '#f3e8ff', color: '#6b21a8' }}>
                                {extractedCount} Extracted Tests
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-light)', fontSize: '0.8125rem' }}>None</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setViewingReport(rep)}
                              title="Open two-panel report viewer"
                            >
                              <Columns size={13} />
                              <span>Open Viewer</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. CHRONOLOGICAL PATIENT TIMELINE */}
      {(activeSubTab === 'all' || activeSubTab === 'timeline') && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Clock size={18} color="var(--primary)" />
                Chronological Patient Timeline
              </h2>
              <p className="card-subtitle">Complete audit trail of registrations, edits, AI extractions, and verifications</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowNoteModal(true)}
            >
              <Plus size={14} />
              <span>+ Add Note</span>
            </button>
          </div>

          <div className="card-body">
            {sortedTimeline.length === 0 ? (
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
                No timeline events recorded yet.
              </div>
            ) : (
              <div className="timeline-container">
                {sortedTimeline.map((ev) => {
                  const evDate = new Date(ev.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={ev.id} className="timeline-item">
                      <div className="timeline-node">
                        {ev.type === 'REGISTRATION' && <User size={12} />}
                        {ev.type === 'REPORT_UPLOAD' && <FileText size={12} />}
                        {ev.type === 'REPORT_EXTRACTED' && <Sparkles size={12} />}
                        {ev.type === 'HUMAN_VERIFICATION' && <Check size={12} />}
                        {ev.type === 'AI_SUMMARY_GENERATED' && <Bot size={12} />}
                        {ev.type === 'UPDATE' && <Edit2 size={12} />}
                        {ev.type === 'CLINICAL_NOTE' && <Clock size={12} />}
                      </div>

                      <div className="timeline-content">
                        <div className="timeline-header">
                          <div className="timeline-title">{ev.title}</div>
                          <div className="timeline-time">{evDate}</div>
                        </div>
                        <div className="timeline-desc">{ev.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: AI Report Upload & Pipeline */}
      {showAiUploadModal && (
        <ReportUploadModal
          patientId={patient.id}
          patientName={patient.name}
          onClose={() => setShowAiUploadModal(false)}
          onReportProcessed={(reportData, extractedData) =>
            onAddExtractedReport(patient.id, reportData, extractedData)
          }
        />
      )}

      {/* Modal: Two-Panel Report Viewer */}
      {viewingReport && (
        <ReportViewerModal
          report={viewingReport}
          patientName={patient.name}
          onClose={() => setViewingReport(null)}
          onUpdateVerification={(resultId, status, updated) =>
            onUpdateVerification(resultId, status, updated)
          }
        />
      )}

      {/* Modal: Manual Report (Phase 1) */}
      {showManualReportModal && (
        <AddReportModal
          patientId={patient.id}
          patientName={patient.name}
          onClose={() => setShowManualReportModal(false)}
          onSaveReport={(reportData) => onAddReport(patient.id, reportData)}
        />
      )}

      {/* Modal: Add Note */}
      {showNoteModal && (
        <AddNoteModal
          patientName={patient.name}
          onClose={() => setShowNoteModal(false)}
          onSaveNote={(title, desc) => onAddNote(patient.id, title, desc)}
        />
      )}
    </div>
  );
};
