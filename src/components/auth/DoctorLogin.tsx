import { useState } from 'react';
import type { DoctorUser } from '../../types/auth';
import { AuthService, DEFAULT_DOCTOR } from '../../services/authService';
import {
  Stethoscope,
  Lock,
  ArrowLeft,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';

interface DoctorLoginProps {
  onLoginSuccess: (doctorUser: DoctorUser) => void;
  onBackToLanding: () => void;
}

export const DoctorLogin: React.FC<DoctorLoginProps> = ({
  onLoginSuccess,
  onBackToLanding
}) => {
  const [identifier, setIdentifier] = useState('doctor@apollo.in');
  const [password, setPassword] = useState('doctor123');
  const [department, setDepartment] = useState('General Medicine & OPD');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your Doctor ID or registered Hospital Email.');
      return;
    }
    setError(null);
    try {
      const user = AuthService.loginDoctor(identifier, password);
      onLoginSuccess(user);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleQuickDemo = () => {
    try {
      const user = AuthService.loginDoctor(DEFAULT_DOCTOR.email, 'demo');
      onLoginSuccess(user);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Safety Banner */}
      <div className="safety-banner">
        <ShieldCheck size={16} className="safety-banner-icon" />
        <span>
          <strong>Clinical Verification Notice:</strong> This clinical portal is strictly for authorized medical practitioners. AI-extracted information must be verified by a medical doctor before finalization.
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Back to landing */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBackToLanding}
            style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8125rem' }}
            id="btn-doc-back-landing"
          >
            <ArrowLeft size={14} />
            <span>Back to Role Selection</span>
          </button>

          {/* Login Card */}
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#0f766e15',
                  color: '#0f766e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Stethoscope size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Doctor Clinical Login
                </h1>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  MedLens Hospital Information System (HIS)
                </p>
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="doctor-identifier">
                  Doctor ID / Hospital Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="doctor-identifier"
                    type="text"
                    className="form-control"
                    placeholder="e.g. DOC-2026-001 or doctor@apollo.in"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="doctor-dept">
                  Department / Ward
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
                  <select
                    id="doctor-dept"
                    className="form-control"
                    style={{ paddingLeft: '36px' }}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="General Medicine & OPD">General Medicine & Outpatient (OPD)</option>
                    <option value="Cardiology">Cardiology Department</option>
                    <option value="Diabetology & Endocrinology">Diabetology & Endocrinology</option>
                    <option value="Emergency & Trauma">Emergency & Trauma Care</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="doctor-password">
                  Hospital Access Key / Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
                  <input
                    id="doctor-password"
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: '36px' }}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                  Demo: Any password accepted for registered clinician profiles
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '4px', backgroundColor: '#0f766e' }}
                id="btn-submit-doctor-login"
              >
                <span>Login to Clinical Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ margin: '20px 0 16px', borderTop: '1px solid var(--border-light)', position: 'relative', textAlign: 'center' }}>
              <span style={{ position: 'relative', top: '-10px', backgroundColor: '#fff', padding: '0 10px', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                OR QUICK DEMO LOGIN
              </span>
            </div>

            {/* Quick 1-Click Demo Login */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleQuickDemo}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderColor: '#0f766e40',
                backgroundColor: '#0f766e0a'
              }}
              id="btn-demo-doctor-login"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                <CheckCircle2 size={18} color="#0f766e" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    {DEFAULT_DOCTOR.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ID: {DEFAULT_DOCTOR.doctorId} &bull; {DEFAULT_DOCTOR.hospital}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f766e' }}>
                1-Click &rarr;
              </span>
            </button>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center' }}>
            Apollo Health City &bull; Hospital Clinical Governance &bull; HIPPA & DISHA Compliant Record System
          </div>
        </div>
      </div>
    </div>
  );
};
