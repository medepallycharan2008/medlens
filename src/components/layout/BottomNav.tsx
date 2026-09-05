import { LayoutDashboard, Users, UserPlus, FolderHeart, Settings } from 'lucide-react';
import type { NavTab } from './Sidebar';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bottom-nav" aria-label="Mobile Navigation">
      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
        id="m-nav-dashboard"
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'patients' ? 'active' : ''}`}
        onClick={() => setActiveTab('patients')}
        id="m-nav-patients"
      >
        <Users size={20} />
        <span>Patients</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'add_patient' ? 'active' : ''}`}
        onClick={() => setActiveTab('add_patient')}
        id="m-nav-add"
      >
        <UserPlus size={20} />
        <span>Add</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'patient_records' ? 'active' : ''}`}
        onClick={() => setActiveTab('patient_records')}
        id="m-nav-records"
      >
        <FolderHeart size={20} />
        <span>Records</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => setActiveTab('settings')}
        id="m-nav-settings"
      >
        <Settings size={20} />
        <span>Settings</span>
      </button>
    </nav>
  );
};
