import { useState, useEffect } from 'react';
import { Clock, Building2, UserPlus, LogOut, Stethoscope } from 'lucide-react';
import type { NavTab } from './Sidebar';

interface NavbarProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenSearch?: () => void;
  doctorName?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setActiveTab, doctorName = 'Dr. A. Deshmukh, MD', onLogout }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      );
    };
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header-bar">
      <div className="header-brand">
        <div className="header-hospital-tag">
          <Building2 size={13} />
          <span>Apollo Health City &bull; General OPD</span>
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
          <Clock size={14} />
          <span>{timeStr || 'Today'}</span>
        </div>

        {/* Doctor Identity Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0f766e15',
            border: '1px solid #0f766e30',
            padding: '4px 10px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <Stethoscope size={15} color="#0f766e" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {doctorName}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#0f766e', fontWeight: 600 }}>
              Attending Physician (Doctor)
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setActiveTab('add_patient')}
          id="btn-header-add-patient"
        >
          <UserPlus size={14} />
          <span>+ Add Patient</span>
        </button>

        {onLogout && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onLogout}
            id="btn-doctor-logout"
            title="Sign out to Role Selection"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};
