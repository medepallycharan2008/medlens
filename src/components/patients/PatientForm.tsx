import { useState, useEffect } from 'react';
import type { Patient, Symptom, MedicalCondition, Allergy, Medication, AllergySeverity } from '../../types/patient';
import { PatientService } from '../../services/patientService';
import type { NavTab } from '../layout/Sidebar';
import {
  User,
  Activity,
  AlertTriangle,
  Pill,
  History,
  Save,
  Plus,
  Trash2,
  HeartHandshake,
  Check,
  ArrowLeft
} from 'lucide-react';

interface PatientFormProps {
  initialPatient?: Patient | null;
  onSavePatient: (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'timeline'> & { id?: string }, updateDescription?: string) => Promise<Patient>;
  onCancel: () => void;
  setActiveTab: (tab: NavTab) => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  initialPatient,
  onSavePatient,
  onCancel,
  setActiveTab
}) => {
  const isEditing = Boolean(initialPatient);

  // Demographic state
  const [patientId, setPatientId] = useState(initialPatient?.patientId || '');
  const [name, setName] = useState(initialPatient?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialPatient?.dateOfBirth || '');
  const [age, setAge] = useState<number | string>(initialPatient?.age !== undefined ? initialPatient.age : '');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>(initialPatient?.sex || 'Male');
  const [phone, setPhone] = useState(initialPatient?.phone || '');
  const [email, setEmail] = useState(initialPatient?.email || '');
  const [address, setAddress] = useState(initialPatient?.address || '');
  const [emergencyName, setEmergencyName] = useState(initialPatient?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(initialPatient?.emergencyContact?.phone || '');
  const [emergencyRelation, setEmergencyRelation] = useState(initialPatient?.emergencyContact?.relation || '');

  // Clinical state
  const [chiefComplaint, setChiefComplaint] = useState(initialPatient?.chiefComplaint || '');
  const [previousHistory, setPreviousHistory] = useState(initialPatient?.previousHistory || '');
  const [previousSurgeries, setPreviousSurgeries] = useState(initialPatient?.previousSurgeries || '');
  const [familyHistory, setFamilyHistory] = useState(initialPatient?.familyHistory || '');
  const [lifestyleInfo, setLifestyleInfo] = useState(initialPatient?.lifestyleInfo || '');

  // Dynamic multi-items
  const [symptoms, setSymptoms] = useState<Symptom[]>(
    initialPatient?.symptoms || []
  );
  const [conditions, setConditions] = useState<MedicalCondition[]>(
    initialPatient?.conditions || []
  );
  const [allergies, setAllergies] = useState<Allergy[]>(
    initialPatient?.allergies || []
  );
  const [medications, setMedications] = useState<Medication[]>(
    initialPatient?.medications || []
  );

  // Form errors & state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeFormSection, setActiveFormSection] = useState<'basic' | 'clinical' | 'allergies_meds' | 'history'>('basic');

  // Auto-generate patient ID if new patient
  useEffect(() => {
    if (!isEditing && !patientId) {
      setPatientId(PatientService.generatePatientId());
    }
  }, [isEditing, patientId]);

  // Handle DOB change -> auto-calculate age
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDateOfBirth(val);
    if (val) {
      const calculated = PatientService.calculateAgeFromDob(val);
      if (calculated !== null) {
        setAge(calculated);
      }
    }
  };

  // Handle Age change -> suggest approximate DOB if DOB is empty
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = parseInt(raw, 10);
    setAge(isNaN(num) ? '' : num);
    if (!isNaN(num) && num >= 0 && !dateOfBirth) {
      setDateOfBirth(PatientService.approximateDobFromAge(num));
    }
  };

  // Dynamic Symptoms management
  const addSymptom = () => {
    setSymptoms(prev => [
      ...prev,
      {
        id: `sym-${Date.now()}`,
        symptom: '',
        duration: '',
        notes: '',
        sourceType: 'USER_PROVIDED'
      }
    ]);
  };

  const updateSymptom = (index: number, field: keyof Symptom, value: string) => {
    setSymptoms(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeSymptom = (index: number) => {
    setSymptoms(prev => prev.filter((_, i) => i !== index));
  };

  // Dynamic Conditions management
  const addCondition = () => {
    setConditions(prev => [
      ...prev,
      {
        id: `cond-${Date.now()}`,
        condition: '',
        diagnosedDate: '',
        notes: '',
        sourceType: 'USER_PROVIDED'
      }
    ]);
  };

  const updateCondition = (index: number, field: keyof MedicalCondition, value: string) => {
    setConditions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  // Dynamic Allergies management
  const addAllergy = () => {
    setAllergies(prev => [
      ...prev,
      {
        id: `alg-${Date.now()}`,
        allergen: '',
        reaction: '',
        severity: 'moderate',
        sourceType: 'USER_PROVIDED'
      }
    ]);
  };

  const updateAllergy = (index: number, field: keyof Allergy, value: any) => {
    setAllergies(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeAllergy = (index: number) => {
    setAllergies(prev => prev.filter((_, i) => i !== index));
  };

  // Dynamic Medications management
  const addMedication = () => {
    setMedications(prev => [
      ...prev,
      {
        id: `med-${Date.now()}`,
        name: '',
        frequency: '',
        duration: '',
        notes: '',
        sourceType: 'USER_PROVIDED'
      }
    ]);
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    setMedications(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeMedication = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    // Filter out empty items
    const cleanSymptoms = symptoms.filter(s => s.symptom.trim().length > 0);
    const cleanConditions = conditions.filter(c => c.condition.trim().length > 0);
    const cleanAllergies = allergies.filter(a => a.allergen.trim().length > 0);
    const cleanMedications = medications.filter(m => m.name.trim().length > 0);

    const formData: Partial<Patient> = {
      id: initialPatient?.id,
      patientId: patientId.trim(),
      name: name.trim(),
      dateOfBirth: dateOfBirth.trim(),
      age: typeof age === 'number' ? age : parseInt(age, 10) || 0,
      sex,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      emergencyContact: {
        name: emergencyName.trim(),
        phone: emergencyPhone.trim(),
        relation: emergencyRelation.trim()
      },
      chiefComplaint: chiefComplaint.trim(),
      symptoms: cleanSymptoms,
      conditions: cleanConditions,
      previousHistory: previousHistory.trim(),
      allergies: cleanAllergies,
      medications: cleanMedications,
      previousSurgeries: previousSurgeries.trim(),
      familyHistory: familyHistory.trim(),
      lifestyleInfo: lifestyleInfo.trim(),
      reports: initialPatient?.reports || []
    };

    const validation = PatientService.validatePatientForm(formData, isEditing);
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Auto-switch to basic section if demographic errors exist
      if (validation.errors.name || validation.errors.patientId || validation.errors.phone || validation.errors.age) {
        setActiveFormSection('basic');
      }
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const updateDescription = isEditing
        ? `Clinical record updated by healthcare staff (Modified fields).`
        : undefined;

      await onSavePatient(
        formData as Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'timeline'> & { id?: string },
        updateDescription
      );
      setIsSaving(false);
      setActiveTab('patient_records');
    } catch (err) {
      setIsSaving(false);
      setSaveError((err as Error).message || 'Failed to save patient information. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title & Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-icon"
            onClick={onCancel}
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="section-title">
              {isEditing ? `Edit Patient Record: ${initialPatient?.name}` : 'Register New Patient'}
            </h1>
            <p className="section-subtitle">
              {isEditing
                ? 'Update patient demographic and clinical details'
                : 'Enter structured patient intake data for clinical records'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving}
            id="btn-submit-patient"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving Record...' : isEditing ? 'Update Record' : 'Save Patient'}</span>
          </button>
        </div>
      </div>

      {/* Global save error banner if any */}
      {saveError && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger-border)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} />
          <span>{saveError}</span>
        </div>
      )}

      {/* Form Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px', overflowX: 'auto' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeFormSection === 'basic' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveFormSection('basic')}
        >
          <User size={14} />
          <span>1. Basic Information</span>
          {(errors.name || errors.patientId || errors.phone || errors.age) && (
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>&bull;</span>
          )}
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeFormSection === 'clinical' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveFormSection('clinical')}
        >
          <Activity size={14} />
          <span>2. Symptoms & Conditions</span>
          {symptoms.length > 0 && <span className="nav-badge">{symptoms.length}</span>}
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeFormSection === 'allergies_meds' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveFormSection('allergies_meds')}
        >
          <Pill size={14} />
          <span>3. Allergies & Medications</span>
          {allergies.length > 0 && (
            <span className="nav-badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>{allergies.length}</span>
          )}
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeFormSection === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveFormSection('history')}
        >
          <History size={14} />
          <span>4. Surgeries & Lifestyle</span>
        </button>
      </div>

      {/* SECTION 1: BASIC INFORMATION */}
      {activeFormSection === 'basic' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <User size={18} color="var(--primary)" />
                Patient Demographics & Contact Details
              </h2>
              <p className="card-subtitle">Essential identification for the hospital registry</p>
            </div>
          </div>

          <div className="card-body">
            <div className="form-grid">
              {/* Patient ID */}
              <div className="form-group">
                <label className="form-label" htmlFor="patientId">
                  Patient ID <span className="form-required">*</span>
                </label>
                <input
                  id="patientId"
                  type="text"
                  className={`form-input font-mono ${errors.patientId ? 'has-error' : ''}`}
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="e.g. ML-2026-1001"
                />
                {errors.patientId ? (
                  <div className="form-error">{errors.patientId}</div>
                ) : (
                  <div className="form-hint">Unique identifier format: ML-[Year]-[Number]</div>
                )}
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="patientName">
                  Full Name <span className="form-required">*</span>
                </label>
                <input
                  id="patientName"
                  type="text"
                  className={`form-input ${errors.name ? 'has-error' : ''}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              {/* Date of Birth */}
              <div className="form-group">
                <label className="form-label" htmlFor="dateOfBirth">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  className={`form-input ${errors.dateOfBirth ? 'has-error' : ''}`}
                  value={dateOfBirth}
                  onChange={handleDobChange}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.dateOfBirth ? (
                  <div className="form-error">{errors.dateOfBirth}</div>
                ) : (
                  <div className="form-hint">Selecting DOB will auto-calculate age</div>
                )}
              </div>

              {/* Age and Sex in 1 row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="patientAge">
                    Age (Years) <span className="form-required">*</span>
                  </label>
                  <input
                    id="patientAge"
                    type="number"
                    min="0"
                    max="125"
                    className={`form-input ${errors.age ? 'has-error' : ''}`}
                    value={age}
                    onChange={handleAgeChange}
                    placeholder="e.g. 45"
                  />
                  {errors.age && <div className="form-error">{errors.age}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="patientSex">
                    Sex <span className="form-required">*</span>
                  </label>
                  <select
                    id="patientSex"
                    className={`form-select ${errors.sex ? 'has-error' : ''}`}
                    value={sex}
                    onChange={(e) => setSex(e.target.value as 'Male' | 'Female' | 'Other')}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.sex && <div className="form-error">{errors.sex}</div>}
                </div>
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label" htmlFor="patientPhone">
                  Phone Number <span className="form-required">*</span>
                </label>
                <input
                  id="patientPhone"
                  type="tel"
                  className={`form-input ${errors.phone ? 'has-error' : ''}`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98201 43210 or 10 digits"
                />
                {errors.phone ? (
                  <div className="form-error">{errors.phone}</div>
                ) : (
                  <div className="form-hint">Mobile contact for patient follow-up</div>
                )}
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label" htmlFor="patientEmail">
                  Email Address
                </label>
                <input
                  id="patientEmail"
                  type="email"
                  className={`form-input ${errors.email ? 'has-error' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. patient@example.in (optional)"
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              {/* Residential Address */}
              <div className="form-group form-grid-full">
                <label className="form-label" htmlFor="patientAddress">
                  Residential Address
                </label>
                <textarea
                  id="patientAddress"
                  className="form-textarea"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, locality, city, state and PIN code"
                />
              </div>

              {/* Emergency Contact Section */}
              <div className="form-grid-full" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '8px' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HeartHandshake size={16} color="var(--primary)" />
                  Emergency Contact Details
                </h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="emergencyName">Contact Name</label>
                    <input
                      id="emergencyName"
                      type="text"
                      className="form-input"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="e.g. Sunita Sharma"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="emergencyPhone">Contact Phone</label>
                    <input
                      id="emergencyPhone"
                      type="tel"
                      className="form-input"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="e.g. +91 98201 43219"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="emergencyRelation">Relationship</label>
                    <input
                      id="emergencyRelation"
                      type="text"
                      className="form-input"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      placeholder="e.g. Spouse, Parent, Sibling, Guardian"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-footer">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setActiveFormSection('clinical')}
            >
              <span>Next: Clinical Information &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: CLINICAL INFORMATION (CHIEF COMPLAINT, SYMPTOMS, CONDITIONS) */}
      {activeFormSection === 'clinical' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Activity size={18} color="var(--primary)" />
                Clinical Information & Symptoms
              </h2>
              <p className="card-subtitle">Chief complaint, presenting symptoms, and documented conditions</p>
            </div>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Chief Complaint */}
            <div className="form-group">
              <label className="form-label" htmlFor="chiefComplaint">
                Chief Complaint (Primary Reason for Visit)
              </label>
              <textarea
                id="chiefComplaint"
                className="form-textarea"
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g. Persistent dry cough for 3 weeks and mild chest discomfort on exertion"
              />
              <div className="form-hint">Brief clinical description of what brought the patient to the hospital</div>
            </div>

            {/* Symptoms Section */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Presenting Symptoms</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                    Add multiple symptoms with duration and clinical observations
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addSymptom}
                  id="btn-add-symptom"
                >
                  <Plus size={14} />
                  <span>+ Add Symptom</span>
                </button>
              </div>

              {symptoms.length === 0 ? (
                <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
                  No symptoms added yet. Click <strong>+ Add Symptom</strong> to log symptom duration and notes.
                </div>
              ) : (
                <div className="dynamic-items-list">
                  {symptoms.map((item, idx) => (
                    <div key={item.id} className="dynamic-item-card">
                      <button
                        type="button"
                        className="dynamic-item-remove"
                        onClick={() => removeSymptom(idx)}
                        title="Remove Symptom"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Symptom Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={item.symptom}
                            onChange={(e) => updateSymptom(idx, 'symptom', e.target.value)}
                            placeholder="e.g. Exertional breathlessness / Fever"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Duration</label>
                          <input
                            type="text"
                            className="form-input"
                            value={item.duration}
                            onChange={(e) => updateSymptom(idx, 'duration', e.target.value)}
                            placeholder="e.g. 5 days, 3 weeks, intermittent"
                          />
                        </div>

                        <div className="form-group form-grid-full">
                          <label className="form-label">Clinical Notes / Triggers</label>
                          <input
                            type="text"
                            className="form-input"
                            value={item.notes}
                            onChange={(e) => updateSymptom(idx, 'notes', e.target.value)}
                            placeholder="e.g. Aggravated after stair climbing, relieved by rest"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Existing Medical Conditions Section */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Existing Medical Conditions</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                    Known chronic ailments, comorbidities, or diagnosed conditions
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addCondition}
                  id="btn-add-condition"
                >
                  <Plus size={14} />
                  <span>+ Add Condition</span>
                </button>
              </div>

              {conditions.length === 0 ? (
                <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
                  No existing conditions specified. Click <strong>+ Add Condition</strong> if the patient has chronic diagnoses.
                </div>
              ) : (
                <div className="dynamic-items-list">
                  {conditions.map((item, idx) => (
                    <div key={item.id} className="dynamic-item-card">
                      <button
                        type="button"
                        className="dynamic-item-remove"
                        onClick={() => removeCondition(idx)}
                        title="Remove Condition"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Condition / Diagnosis</label>
                          <input
                            type="text"
                            className="form-input"
                            value={item.condition}
                            onChange={(e) => updateCondition(idx, 'condition', e.target.value)}
                            placeholder="e.g. Type 2 Diabetes Mellitus, Hypertension"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Diagnosed Date / Year</label>
                          <input
                            type="date"
                            className="form-input"
                            value={item.diagnosedDate || ''}
                            onChange={(e) => updateCondition(idx, 'diagnosedDate', e.target.value)}
                          />
                        </div>

                        <div className="form-group form-grid-full">
                          <label className="form-label">Clinical Notes / Current Status</label>
                          <input
                            type="text"
                            className="form-input"
                            value={item.notes}
                            onChange={(e) => updateCondition(idx, 'notes', e.target.value)}
                            placeholder="e.g. Under oral therapy, regularly checked quarterly"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Previous History */}
            <div className="form-group" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <label className="form-label" htmlFor="previousHistory">
                Previous Medical History Summary
              </label>
              <textarea
                id="previousHistory"
                className="form-textarea"
                rows={2}
                value={previousHistory}
                onChange={(e) => setPreviousHistory(e.target.value)}
                placeholder="e.g. History of jaundice in childhood, no history of TB or asthma..."
              />
            </div>
          </div>

          <div className="card-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveFormSection('basic')}
            >
              &larr; Back to Demographics
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setActiveFormSection('allergies_meds')}
            >
              Next: Allergies & Medications &rarr;
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: ALLERGIES & CURRENT MEDICATIONS */}
      {activeFormSection === 'allergies_meds' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Pill size={18} color="var(--primary)" />
                Allergies & Current Medications
              </h2>
              <p className="card-subtitle">Critical safety records to prevent drug interactions</p>
            </div>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Allergies Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} color="var(--danger)" />
                    Allergies & Adverse Drug Reactions
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                    Record all drug, food, or environmental allergens with reaction severity
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addAllergy}
                  id="btn-add-allergy"
                >
                  <Plus size={14} />
                  <span>+ Add Allergy</span>
                </button>
              </div>

              {allergies.length === 0 ? (
                <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
                  No allergies reported. Click <strong>+ Add Allergy</strong> to record any known sensitivities.
                </div>
              ) : (
                <div className="dynamic-items-list">
                  {allergies.map((item, idx) => (
                    <div
                      key={item.id}
                      className="dynamic-item-card"
                      style={{
                        backgroundColor: item.severity === 'severe' || item.severity === 'life-threatening' ? '#fff5f5' : 'var(--bg-subtle)',
                        borderColor: item.severity === 'severe' || item.severity === 'life-threatening' ? 'var(--danger-border)' : 'var(--border-light)'
                      }}
                    >
                      <button
                        type="button"
                        className="dynamic-item-remove"
                        onClick={() => removeAllergy(idx)}
                        title="Remove Allergy"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Allergen / Substance</label>
                          <input
                            type="text"
                            className="form-input"
                            value={item.allergen}
                            onChange={(e) => updateAllergy(idx, 'allergen', e.target.value)}
                            placeholder="e.g. Penicillin, Sulfa drugs, Peanuts"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Severity Level</label>
                          <select
                            className="form-select"
                            value={item.severity}
                            onChange={(e) => updateAllergy(idx, 'severity', e.target.value as AllergySeverity)}
                          >
                            <option value="mild">Mild (Localized rash, mild itching)</option>
                            <option value="moderate">Moderate (Urticaria, facial swelling)</option>
                            <option value="severe">Severe (Bronchospasm, severe edema)</option>
                            <option value="life-threatening">Life-Threatening (Anaphylaxis shock)</option>
                          </select>
                        </div>

                        <div className="form-group form-grid-full">
                          <label className="form-label">Reaction Description</label>
                          <input
                            type="text"
                            className="form-input"
                            value={item.reaction}
                            onChange={(e) => updateAllergy(idx, 'reaction', e.target.value)}
                            placeholder="e.g. Generalized hives, dyspnea within 20 minutes"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Current Medications Section */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Pill size={16} color="var(--primary)" />
                    Current Medications
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                    Prescribed drugs, over-the-counter pills, or ongoing therapies
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addMedication}
                  id="btn-add-medication"
                >
                  <Plus size={14} />
                  <span>+ Add Medication</span>
                </button>
              </div>

              {medications.length === 0 ? (
                <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
                  No ongoing medications recorded. Click <strong>+ Add Medication</strong> to add current prescriptions.
                </div>
              ) : (
                <div className="dynamic-items-list">
                  {medications.map((item, idx) => (
                    <div key={item.id} className="dynamic-item-card">
                      <button
                        type="button"
                        className="dynamic-item-remove"
                        onClick={() => removeMedication(idx)}
                        title="Remove Medication"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Medicine Name & Strength</label>
                          <input
                            type="text"
                            className="form-input"
                            value={item.name}
                            onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                            placeholder="e.g. Metformin 500mg, Telmisartan 40mg"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Frequency / Dosage</label>
                          <input
                            type="text"
                            className="form-input"
                            value={item.frequency}
                            onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                            placeholder="e.g. Twice a day after meals, Once daily at night"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Duration</label>
                          <input
                            type="text"
                            className="form-input"
                            value={item.duration}
                            onChange={(e) => updateMedication(idx, 'duration', e.target.value)}
                            placeholder="e.g. Ongoing, 7 days, 1 month"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Special Notes / Instructions</label>
                          <input
                            type="text"
                            className="form-input"
                            value={item.notes}
                            onChange={(e) => updateMedication(idx, 'notes', e.target.value)}
                            placeholder="e.g. Take with warm water, avoid dairy"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveFormSection('clinical')}
            >
              &larr; Back to Clinical
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setActiveFormSection('history')}
            >
              Next: Surgeries & Lifestyle &rarr;
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: SURGERIES, FAMILY HISTORY & LIFESTYLE */}
      {activeFormSection === 'history' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <History size={18} color="var(--primary)" />
                Surgical History, Family Medical Background & Lifestyle
              </h2>
              <p className="card-subtitle">Comprehensive contextual background</p>
            </div>
          </div>

          <div className="card-body">
            <div className="form-grid">
              {/* Previous Surgeries */}
              <div className="form-group form-grid-full">
                <label className="form-label" htmlFor="previousSurgeries">
                  Previous Surgeries & Procedures
                </label>
                <textarea
                  id="previousSurgeries"
                  className="form-textarea"
                  rows={2}
                  value={previousSurgeries}
                  onChange={(e) => setPreviousSurgeries(e.target.value)}
                  placeholder="e.g. Open appendectomy in 2012 at Lilavati Hospital. Bilateral cataract surgery (2023)."
                />
              </div>

              {/* Family Medical History */}
              <div className="form-group form-grid-full">
                <label className="form-label" htmlFor="familyHistory">
                  Family Medical History
                </label>
                <textarea
                  id="familyHistory"
                  className="form-textarea"
                  rows={2}
                  value={familyHistory}
                  onChange={(e) => setFamilyHistory(e.target.value)}
                  placeholder="e.g. Father had CAD with stent placement at 62. Mother has diabetes and hypertension."
                />
                <div className="form-hint">Relevant genetic, cardiovascular, or endocrine hereditary patterns</div>
              </div>

              {/* Lifestyle Information */}
              <div className="form-group form-grid-full">
                <label className="form-label" htmlFor="lifestyleInfo">
                  Relevant Lifestyle Information
                </label>
                <textarea
                  id="lifestyleInfo"
                  className="form-textarea"
                  rows={2}
                  value={lifestyleInfo}
                  onChange={(e) => setLifestyleInfo(e.target.value)}
                  placeholder="e.g. Non-smoker, vegetarian diet, IT desk job with high screen time, 20-min daily walks."
                />
                <div className="form-hint">Diet, physical activity, occupation, smoking or alcohol habits</div>
              </div>
            </div>
          </div>

          <div className="card-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveFormSection('allergies_meds')}
            >
              &larr; Back to Allergies & Medications
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              <Check size={16} />
              <span>{isSaving ? 'Saving Record...' : isEditing ? 'Update Patient Record' : 'Save Patient Record'}</span>
            </button>
          </div>
        </div>
      )}
    </form>
  );
};
