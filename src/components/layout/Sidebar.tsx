import React from 'react';
import { LayoutDashboard, Users, UserPlus, FolderHeart, Settings, Activity } from 'lucide-react';

export type NavTab = 'dashboard' | 'patients' | 'add_patient' | 'patient_records' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  patientCount: number;
  hasSelectedPatient: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  patientCount,
  hasSelectedPatient
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="header-brand-logo">
          <Activity size={22} strokeWidth={2.4} />
        </div>
        <div>
          <div className="header-brand-title">MedLens</div>
          <div className="header-brand-subtitle">Clinical Information System</div>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main Navigation">
        <button
          type="button"
          className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          id="nav-dashboard"
        >
          <LayoutDashboard size={18} className="nav-icon" />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={`nav-link ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
          id="nav-patients"
        >
          <Users size={18} className="nav-icon" />
          <span>Patients</span>
          <span className="nav-badge">{patientCount}</span>
        </button>

        <button
          type="button"
          className={`nav-link ${activeTab === 'add_patient' ? 'active' : ''}`}
          onClick={() => setActiveTab('add_patient')}
          id="nav-add-patient"
        >
          <UserPlus size={18} className="nav-icon" />
          <span>Add Patient</span>
        </button>

        <button
          type="button"
          className={`nav-link ${activeTab === 'patient_records' ? 'active' : ''}`}
          onClick={() => setActiveTab('patient_records')}
          id="nav-records"
        >
          <FolderHeart size={18} className="nav-icon" />
          <span>Patient Records</span>
          {hasSelectedPatient && (
            <span className="nav-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>Active</span>
          )}
        </button>

        <button
          type="button"
          className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          id="nav-settings"
        >
          <Settings size={18} className="nav-icon" />
          <span>Settings</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '2px' }}>
          Apollo OPD Ward 3
        </div>
        <div>Phase 1 &bull; Staff Mode</div>
      </div>
    </aside>
  );
};
