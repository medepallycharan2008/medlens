import { useState, useEffect } from 'react';
import type { PatientUser } from '../../types/auth';
import type { Patient, MedicalReport, ExtractedLabResult } from '../../types/patient';
import { PatientStorageService } from '../../services/storage';
import { ExtractionPipelineService, PRESET_MEDICAL_TEMPLATES } from '../../services/extractionPipeline';
import { LabStatusBadge, VerificationBadge, SourceBadge } from '../common/Badge';
import {
  Activity,
  LogOut,
  UploadCloud,
  FileText,
  User,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface PatientPortalProps {
  currentUser: PatientUser;
  onLogout: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ currentUser, onLogout }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'upload' | 'reports' | 'labs'>('details');

  // Upload & Extraction State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('apollo_cbc');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [extractedReview, setExtractedReview] = useState<{
    reportName: string;
    reportType: string;
    fileSize: string;
    results: ExtractedLabResult[];
    sourcePreview?: string;
    rawText?: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Self-report edit form state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editChiefComplaint, setEditChiefComplaint] = useState('');
  const [editSymptomText, setEditSymptomText] = useState('');
  const [editSymptomDuration, setEditSymptomDuration] = useState('3 days');
  const [editAllergyText, setEditAllergyText] = useState('');
  const [editMedicationText, setEditMedicationText] = useState('');
  const [editHistoryText, setEditHistoryText] = useState('');

  // Reload patient data from local storage
  const reloadPatient = () => {
    const data = PatientStorageService.getById(currentUser.id);
    if (data) {
      setPatient(data);
      setEditChiefComplaint(data.chiefComplaint || '');
      setEditHistoryText(data.previousHistory || '');
    }
  };

  useEffect(() => {
    reloadPatient();
  }, [currentUser.id]);

  if (!patient) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading your medical records...</p>
      </div>
    );
  }

  // Handle document upload and OCR processing
  const handleStartExtraction = async (fileToProcess?: File) => {
    const file = fileToProcess || selectedFile;
    const template = PRESET_MEDICAL_TEMPLATES.find(t => t.templateId === selectedTemplateId);
    const reportName = file ? file.name : (template?.sampleFileName || 'Medical_Lab_Report.pdf');

    setIsProcessing(true);
    setProcessingStep('Uploading document to secure hospital server...');
    setSuccessMessage(null);

    try {
      await new Promise(r => setTimeout(r, 400));
      setProcessingStep('Performing Optical Character Recognition (OCR)...');
      await new Promise(r => setTimeout(r, 500));
      setProcessingStep('Extracting medical values and reference ranges...');

      const result = await ExtractionPipelineService.processDocument({
        patientId: patient.id,
        reportId: `rep-${Date.now()}`,
        reportName,
        file: file || null,
        templateId: selectedTemplateId
      });

      setProcessingStep('Validating source document reference ranges...');
      await new Promise(r => setTimeout(r, 400));

      // Present the extracted data for Patient Review
      setExtractedReview({
        reportName,
        reportType: template?.department || 'Diagnostic Pathology',
        fileSize: file ? `${(file.size / 1024).toFixed(1)} KB` : '184 KB',
        results: result.extractedData.results,
        sourcePreview: result.sourceDocumentPreview,
        rawText: result.rawText
      });
    } catch (err) {
      alert('Extraction failed: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Patient confirms extracted information
  const handleConfirmExtractedData = () => {
    if (!extractedReview) return;

    const now = new Date().toISOString();
    // Mark every extracted result as PATIENT_CONFIRMED
    const confirmedResults: ExtractedLabResult[] = extractedReview.results.map(r => ({
      ...r,
      verificationStatus: 'PATIENT_CONFIRMED',
      patientConfirmedAt: now
    }));

    const reportData: Omit<MedicalReport, 'reportId' | 'patientId' | 'sourceType'> = {
      reportName: extractedReview.reportName,
      reportType: extractedReview.reportType,
      uploadDate: now.split('T')[0],
      reportDate: now.split('T')[0],
      fileSize: extractedReview.fileSize,
      fileDataUrl: extractedReview.sourcePreview,
      status: 'PROCESSED',
      notes: `Uploaded and confirmed by patient on ${new Date().toLocaleDateString('en-IN')}`
    };

    PatientStorageService.addExtractedReport(patient.id, reportData, {
      reportId: `rep-${Date.now()}`,
      laboratoryName: extractedReview.reportType,
      reportDate: now.split('T')[0],
      results: confirmedResults,
      extractedAt: now,
      rawText: extractedReview.rawText
    });

    setExtractedReview(null);
    setSelectedFile(null);
    setSuccessMessage('Medical report and extracted lab results have been confirmed and saved to your health record. Your consulting doctor can now view them.');
    reloadPatient();
    setActiveTab('reports');
  };

  // Handle self-reported information updates
  const handleSaveSelfReported = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSymptoms = [...patient.symptoms];
    if (editSymptomText.trim()) {
      updatedSymptoms.push({
        id: `sym-${Date.now()}`,
        symptom: editSymptomText.trim(),
        duration: editSymptomDuration,
        notes: 'Self-reported by patient via Patient Portal',
        sourceType: 'USER_PROVIDED'
      });
    }

    const updatedAllergies = [...patient.allergies];
    if (editAllergyText.trim()) {
      updatedAllergies.push({
        id: `all-${Date.now()}`,
        allergen: editAllergyText.trim(),
        reaction: 'Self-reported reaction',
        severity: 'moderate',
        sourceType: 'USER_PROVIDED'
      });
    }

    const updatedMedications = [...patient.medications];
    if (editMedicationText.trim()) {
      updatedMedications.push({
        id: `med-${Date.now()}`,
        name: editMedicationText.trim(),
        frequency: 'Daily',
        duration: 'Ongoing',
        notes: 'Entered by patient',
        sourceType: 'USER_PROVIDED'
      });
    }

    PatientStorageService.update(
      patient.id,
      {
        chiefComplaint: editChiefComplaint.trim(),
        previousHistory: editHistoryText.trim(),
        symptoms: updatedSymptoms,
        allergies: updatedAllergies,
        medications: updatedMedications
      },
      'Patient updated personal symptoms, allergies, or medications via Patient Portal'
    );

    setEditSymptomText('');
    setEditAllergyText('');
    setEditMedicationText('');
    setShowEditModal(false);
    setSuccessMessage('Your profile information was successfully updated.');
    reloadPatient();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Top hospital safety banner */}
      <div className="safety-banner">
        <ShieldCheck size={16} className="safety-banner-icon" />
        <span>
          <strong>Patient Portal Notice:</strong> MedLens organizes and displays your medical information for your healthcare provider. This platform does not provide medical diagnoses or prescriptions.
        </span>
      </div>

      {/* Patient Header Navigation */}
      <header
        style={{
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-light)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-main)', lineHeight: 1.1 }}>
                MedLens
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Patient Health Portal
              </div>
            </div>
          </div>

          <div style={{ height: '28px', width: '1px', backgroundColor: 'var(--border-light)' }} />

          {/* Patient Quick Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}
            >
              {patient.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {patient.name}
                <span
                  style={{
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}
                >
                  Patient
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ID: <strong>{patient.patientId}</strong> &bull; {patient.age}y / {patient.sex} &bull; {patient.phone}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onLogout}
            style={{ padding: '6px 12px', fontSize: '0.8125rem', gap: '6px' }}
            id="btn-patient-logout"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '24px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* Success Alert */}
        {successMessage && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontWeight: 600 }}
            >
              &times;
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-medium)', marginBottom: '24px' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'details' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
            onClick={() => setActiveTab('details')}
            id="tab-patient-details"
          >
            <User size={16} />
            <span>My Health Details</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
            onClick={() => setActiveTab('upload')}
            id="tab-patient-upload"
          >
            <UploadCloud size={16} />
            <span>Upload Medical Report</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
            onClick={() => setActiveTab('reports')}
            id="tab-patient-reports"
          >
            <FileText size={16} />
            <span>My Reports ({patient.reports?.length || 0})</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'labs' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
            onClick={() => setActiveTab('labs')}
            id="tab-patient-labs"
          >
            <FileSpreadsheet size={16} />
            <span>My Lab Results ({patient.labResults?.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: Patient-Provided Details */}
        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Patient-Reported Information
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Information you have provided about your symptoms, ongoing medications, and health history.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEditModal(true)}
                id="btn-edit-patient-info"
              >
                <Plus size={14} />
                <span>Update My Information</span>
              </button>
            </div>

            {/* Delineation banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: 'var(--surface-sunken)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)'
              }}
            >
              <SourceBadge sourceType="USER_PROVIDED" />
              <span>
                These details are entered by you. Your consulting doctor will review them during your appointment.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Chief Complaint */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Reason for Visit</h3>
                  <SourceBadge sourceType="USER_PROVIDED" />
                </div>
                <div style={{ fontSize: '0.9375rem', color: 'var(--text-main)', lineHeight: 1.5, backgroundColor: 'var(--surface-sunken)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  {patient.chiefComplaint || 'No reason provided.'}
                </div>
              </div>

              {/* Reported Symptoms */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Reported Symptoms</h3>
                  <SourceBadge sourceType="USER_PROVIDED" />
                </div>
                {patient.symptoms && patient.symptoms.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {patient.symptoms.map(s => (
                      <div
                        key={s.id}
                        style={{
                          padding: '10px 12px',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{s.symptom}</strong>
                          {s.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{s.notes}</div>}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--surface-sunken)', padding: '2px 8px', borderRadius: '12px' }}>
                          {s.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>No symptoms reported yet.</p>
                )}
              </div>

              {/* Current Medications */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Current Medications</h3>
                  <SourceBadge sourceType="USER_PROVIDED" />
                </div>
                {patient.medications && patient.medications.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {patient.medications.map(m => (
                      <div
                        key={m.id}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {m.frequency} &bull; {m.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>No ongoing medications reported.</p>
                )}
              </div>

              {/* Known Allergies */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Known Allergies</h3>
                  <SourceBadge sourceType="USER_PROVIDED" />
                </div>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {patient.allergies.map(a => (
                      <span
                        key={a.id}
                        style={{
                          backgroundColor: '#fef2f2',
                          color: '#b91c1c',
                          border: '1px solid #fecaca',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '0.8125rem',
                          fontWeight: 500
                        }}
                      >
                        {a.allergen} ({a.reaction || 'Allergic reaction'})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>No known drug/food allergies reported.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Upload Medical Report & Patient Review/Confirm */}
        {activeTab === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Upload Medical Report
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Upload laboratory test documents (PDF, JPG, JPEG, PNG). The system will extract your test parameters for your doctor.
              </p>
            </div>

            {/* If extraction review is active, show the confirmation screen */}
            {extractedReview ? (
              <div className="card" style={{ padding: '28px', border: '2px solid var(--primary-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Review Extracted Information
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      We extracted the following test values from <strong>{extractedReview.reportName}</strong>. Please review and confirm before submitting.
                    </p>
                  </div>
                </div>

                {/* Important source range notice */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-subtle)',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <AlertCircle size={18} color="var(--primary)" />
                  <div>
                    <strong>Strict Medical Source Policy:</strong> MedLens only displays reference ranges printed directly on your uploaded report. It does not invent or assume reference ranges.
                  </div>
                </div>

                {/* Extracted Lab Items Table */}
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--surface-sunken)', textAlign: 'left', fontSize: '0.8125rem' }}>
                        <th style={{ padding: '10px 14px' }}>Test Parameter</th>
                        <th style={{ padding: '10px 14px' }}>Extracted Value</th>
                        <th style={{ padding: '10px 14px' }}>Reference Range (Source Report)</th>
                        <th style={{ padding: '10px 14px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extractedReview.results.map((r, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>
                            {r.testName}
                          </td>
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>
                            {r.value} {r.unit}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            {r.referenceRange ? (
                              <span>{r.referenceRange} {r.unit}</span>
                            ) : (
                              <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>
                                Reference range not provided in source report
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <LabStatusBadge status={r.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setExtractedReview(null)}
                    id="btn-cancel-extraction-review"
                  >
                    Cancel & Re-upload
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleConfirmExtractedData}
                    style={{ gap: '8px' }}
                    id="btn-confirm-save-patient-data"
                  >
                    <CheckCircle2 size={16} />
                    <span>Confirm and Save to Record</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Drag & Drop File Upload Area */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setSelectedFile(e.dataTransfer.files[0]);
                    }
                  }}
                  style={{
                    border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border-medium)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '40px 24px',
                    textAlign: 'center',
                    backgroundColor: dragActive ? 'var(--primary-light)' : 'var(--bg-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '14px',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <UploadCloud size={28} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                      Drag and drop your report here, or click to browse
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Supports PDF, JPG, JPEG, and PNG documents up to 25 MB
                    </p>
                  </div>

                  <input
                    type="file"
                    id="file-upload-input"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />

                  <label
                    htmlFor="file-upload-input"
                    className="btn btn-secondary"
                    style={{ cursor: 'pointer', padding: '8px 18px' }}
                    id="btn-browse-file"
                  >
                    Select Document from Computer / Phone
                  </label>

                  {selectedFile && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '8px 14px',
                        backgroundColor: 'var(--surface-sunken)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <FileText size={16} color="var(--primary)" />
                      <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>

                {/* Preset Templates for Easy Clinical Testing */}
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                      Or Choose a Standard Hospital Report Sample
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Test the OCR pipeline and source reference range rules with standard Indian lab templates.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {PRESET_MEDICAL_TEMPLATES.map(tmpl => (
                      <div
                        key={tmpl.templateId}
                        onClick={() => setSelectedTemplateId(tmpl.templateId)}
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${selectedTemplateId === tmpl.templateId ? 'var(--primary)' : 'var(--border-light)'}`,
                          backgroundColor: selectedTemplateId === tmpl.templateId ? 'var(--primary-light)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{tmpl.department}</strong>
                          {tmpl.hasReferenceRanges ? (
                            <span style={{ fontSize: '0.6875rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px' }}>
                              With Ranges
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.6875rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px' }}>
                              No Ranges
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                          {tmpl.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                          {tmpl.labName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload Action Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isProcessing}
                    onClick={() => handleStartExtraction()}
                    style={{ padding: '10px 24px', fontSize: '0.9375rem', gap: '8px' }}
                    id="btn-process-upload-report"
                  >
                    {isProcessing ? (
                      <>
                        <Clock size={18} className="spin" />
                        <span>{processingStep}</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={18} />
                        <span>Extract & Review Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: My Reports List */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Uploaded Medical Reports
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Documents uploaded to your patient record and accessible to your attending doctor.
              </p>
            </div>

            {patient.reports && patient.reports.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {patient.reports.map(rep => (
                  <div
                    key={rep.reportId}
                    className="card"
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                          {rep.reportName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                          <span>Type: {rep.reportType}</span>
                          <span>&bull;</span>
                          <span>Uploaded: {rep.uploadDate}</span>
                          <span>&bull;</span>
                          <span>Size: {rep.fileSize || '180 KB'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: rep.status === 'PROCESSED' ? '#ecfdf5' : '#eff6ff',
                          color: rep.status === 'PROCESSED' ? '#065f46' : '#1e40af'
                        }}
                      >
                        {rep.status}
                      </span>
                      {rep.extractedData && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          {rep.extractedData.results?.length || 0} parameters extracted
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p>No medical reports uploaded yet.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: '12px' }}
                  onClick={() => setActiveTab('upload')}
                >
                  Upload Your First Report
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: My Structured Laboratory Results */}
        {activeTab === 'labs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Structured Laboratory Results
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Parameters extracted from your uploaded medical documents, strictly evaluated against printed source ranges.
              </p>
            </div>

            {patient.labResults && patient.labResults.length > 0 ? (
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--surface-sunken)', textAlign: 'left', fontSize: '0.8125rem' }}>
                      <th style={{ padding: '12px 16px' }}>Investigation / Test</th>
                      <th style={{ padding: '12px 16px' }}>Observed Result</th>
                      <th style={{ padding: '12px 16px' }}>Source Reference Range</th>
                      <th style={{ padding: '12px 16px' }}>Result Status</th>
                      <th style={{ padding: '12px 16px' }}>Verification</th>
                      <th style={{ padding: '12px 16px' }}>Source Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.labResults.map(lab => (
                      <tr key={lab.id} style={{ borderTop: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {lab.testName}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>
                          {lab.value} {lab.unit}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {lab.referenceRange ? (
                            <span>{lab.referenceRange} {lab.unit}</span>
                          ) : (
                            <span style={{ color: 'var(--text-light)', fontStyle: 'italic', fontSize: '0.8125rem' }}>
                              Reference range not provided in source report
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <LabStatusBadge status={lab.status} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <VerificationBadge
                            status={lab.verificationStatus}
                            verifiedBy={lab.doctorVerifiedBy || lab.verifiedBy}
                          />
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {lab.sourceReportName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No laboratory results available in your record.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Update Information Modal */}
      {showEditModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
              Update Personal Health Information
            </h3>

            <form onSubmit={handleSaveSelfReported} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-cc">
                  Chief Complaint / Reason for Visit
                </label>
                <textarea
                  id="edit-cc"
                  className="form-control"
                  rows={2}
                  value={editChiefComplaint}
                  onChange={(e) => setEditChiefComplaint(e.target.value)}
                  placeholder="Describe your primary symptoms or reason for visit..."
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-sym">
                  Add New Symptom
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="edit-sym"
                    className="form-control"
                    placeholder="e.g. Mild headache, feverish feeling"
                    value={editSymptomText}
                    onChange={(e) => setEditSymptomText(e.target.value)}
                  />
                  <input
                    className="form-control"
                    style={{ width: '120px' }}
                    placeholder="Duration"
                    value={editSymptomDuration}
                    onChange={(e) => setEditSymptomDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-med">
                  Add Current Medication
                </label>
                <input
                  id="edit-med"
                  className="form-control"
                  placeholder="e.g. Metformin 500mg, Paracetamol"
                  value={editMedicationText}
                  onChange={(e) => setEditMedicationText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-all">
                  Add Known Allergy
                </label>
                <input
                  id="edit-all"
                  className="form-control"
                  placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
                  value={editAllergyText}
                  onChange={(e) => setEditAllergyText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-hist">
                  Medical / Surgical History Notes
                </label>
                <textarea
                  id="edit-hist"
                  className="form-control"
                  rows={2}
                  value={editHistoryText}
                  onChange={(e) => setEditHistoryText(e.target.value)}
                  placeholder="e.g. Diagnosed with Type 2 Diabetes in 2021..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="btn-save-patient-self-info"
                >
                  Save Information
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
