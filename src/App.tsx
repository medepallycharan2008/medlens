import { useState, useEffect } from 'react';
import { usePatients } from './hooks/usePatients';
import type { Patient } from './types/patient';
import type { UserRole, PatientUser, DoctorUser } from './types/auth';
import { AuthService } from './services/authService';

// Auth & Portal Views
import { LandingPage } from './components/auth/LandingPage';
import { PatientLogin } from './components/auth/PatientLogin';
import { DoctorLogin } from './components/auth/DoctorLogin';
import { PatientPortal } from './components/patient-portal/PatientPortal';

// Doctor / HIS Views
import { Sidebar } from './components/layout/Sidebar';
import type { NavTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { SafetyBanner } from './components/common/SafetyBanner';
import { Dashboard } from './components/dashboard/Dashboard';
import { PatientList } from './components/patients/PatientList';
import { PatientForm } from './components/patients/PatientForm';
import { PatientProfile } from './components/patients/PatientProfile';
import { SettingsView } from './components/settings/SettingsView';

export function App() {
  // Session & Authentication state
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [authView, setAuthView] = useState<'landing' | 'patient_login' | 'doctor_login'>('landing');
  const [currentPatientUser, setCurrentPatientUser] = useState<PatientUser | null>(null);
  const [currentDoctorUser, setCurrentDoctorUser] = useState<DoctorUser | null>(null);

  // Doctor HIS navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const {
    patients,
    selectedPatient,
    selectedPatientId,
    loading,
    selectPatient,
    refreshPatients,
    createPatient,
    updatePatient,
    addReport,
    addExtractedReport,
    updateLabResultVerification,
    generateAndSaveSummary,
    addTimelineNote
  } = usePatients();

  // Initialize session from storage (if previously logged in)
  useEffect(() => {
    const session = AuthService.getCurrentSession();
    if (session.role === 'patient' && session.patientUser) {
      setCurrentRole('patient');
      setCurrentPatientUser(session.patientUser);
    } else if (session.role === 'doctor' && session.doctorUser) {
      setCurrentRole('doctor');
      setCurrentDoctorUser(session.doctorUser);
    } else {
      // Default to landing page on initial visit
      setCurrentRole(null);
      setAuthView('landing');
    }
  }, []);

  // Logout handler
  const handleLogout = () => {
    AuthService.logout();
    setCurrentRole(null);
    setCurrentPatientUser(null);
    setCurrentDoctorUser(null);
    setAuthView('landing');
    refreshPatients();
  };

  // Doctor Navigation handlers
  const handleSelectPatient = (id: string) => {
    selectPatient(id);
    setActiveTab('patient_records');
  };

  const handleStartEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setActiveTab('add_patient');
  };

  const handleCancelForm = () => {
    if (editingPatient) {
      setActiveTab('patient_records');
    } else {
      setActiveTab(patients.length > 0 ? 'patients' : 'dashboard');
    }
    setEditingPatient(null);
  };

  const handleSavePatient = async (
    patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'timeline'> & { id?: string },
    updateDescription?: string
  ): Promise<Patient> => {
    if (editingPatient && patientData.id) {
      const updated = await updatePatient(patientData.id, patientData, updateDescription);
      setEditingPatient(null);
      return updated;
    } else {
      const created = await createPatient(patientData);
      setEditingPatient(null);
      return created;
    }
  };

  // 1. Role Selection & Authentication Flows
  if (currentRole === null) {
    if (authView === 'patient_login') {
      return (
        <PatientLogin
          onLoginSuccess={(patientUser) => {
            setCurrentPatientUser(patientUser);
            setCurrentRole('patient');
            refreshPatients();
          }}
          onBackToLanding={() => setAuthView('landing')}
        />
      );
    }

    if (authView === 'doctor_login') {
      return (
        <DoctorLogin
          onLoginSuccess={(doctorUser) => {
            setCurrentDoctorUser(doctorUser);
            setCurrentRole('doctor');
            refreshPatients();
          }}
          onBackToLanding={() => setAuthView('landing')}
        />
      );
    }

    // Default entry: Landing Page with Patient / Doctor selection
    return (
      <LandingPage
        onSelectRole={(role) => {
          if (role === 'patient') {
            setAuthView('patient_login');
          } else {
            setAuthView('doctor_login');
          }
        }}
      />
    );
  }

  // 2. Patient Flow (Patient Portal)
  if (currentRole === 'patient' && currentPatientUser) {
    return (
      <PatientPortal
        currentUser={currentPatientUser}
        onLogout={handleLogout}
      />
    );
  }

  // 3. Doctor Flow (Hospital Information System)
  return (
    <div className="app-layout">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'add_patient') {
            setEditingPatient(null);
          }
          setActiveTab(tab);
        }}
        patientCount={patients.length}
        hasSelectedPatient={Boolean(selectedPatientId)}
      />

      {/* Main View Area */}
      <div className="main-wrapper">
        {/* Safety Disclaimer Banner */}
        <SafetyBanner />

        {/* Top Header Bar with Doctor Info & Logout */}
        <Navbar
          setActiveTab={(tab) => {
            if (tab === 'add_patient') {
              setEditingPatient(null);
            }
            setActiveTab(tab);
          }}
          doctorName={currentDoctorUser?.name || 'Dr. A. Deshmukh, MD'}
          onLogout={handleLogout}
        />

        {/* Active Content */}
        <main className="main-content">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px', color: 'var(--text-subtle)' }}>
              Loading MedLens records...
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  patients={patients}
                  setActiveTab={setActiveTab}
                  onSelectPatient={handleSelectPatient}
                />
              )}

              {activeTab === 'patients' && (
                <PatientList
                  patients={patients}
                  onSelectPatient={handleSelectPatient}
                  onEditPatient={handleStartEditPatient}
                  setActiveTab={(tab) => {
                    if (tab === 'add_patient') setEditingPatient(null);
                    setActiveTab(tab);
                  }}
                />
              )}

              {activeTab === 'add_patient' && (
                <PatientForm
                  initialPatient={editingPatient}
                  onSavePatient={handleSavePatient}
                  onCancel={handleCancelForm}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'patient_records' && (
                <PatientProfile
                  patient={selectedPatient || (patients.length > 0 ? patients[0] : null)}
                  onEditPatient={handleStartEditPatient}
                  onAddReport={addReport}
                  onAddExtractedReport={addExtractedReport}
                  onUpdateVerification={(resultId, status, updated) =>
                    selectedPatient
                      ? updateLabResultVerification(selectedPatient.id, resultId, status, updated)
                      : (Promise.resolve() as any)
                  }
                  onGenerateSummary={(patientId) => generateAndSaveSummary(patientId)}
                  onAddNote={addTimelineNote}
                  setActiveTab={(tab) => {
                    if (tab === 'add_patient') setEditingPatient(null);
                    setActiveTab(tab);
                  }}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView onDataChanged={refreshPatients} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'add_patient') {
            setEditingPatient(null);
          }
          setActiveTab(tab);
        }}
      />
    </div>
  );
}

export default App;
