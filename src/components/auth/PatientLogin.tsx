import { useState } from 'react';
import type { PatientUser } from '../../types/auth';
import { AuthService } from '../../services/authService';
import {
  User,
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface PatientLoginProps {
  onLoginSuccess: (patientUser: PatientUser) => void;
  onBackToLanding: () => void;
}

export const PatientLogin: React.FC<PatientLoginProps> = ({
  onLoginSuccess,
  onBackToLanding
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAge, setRegAge] = useState<number | string>('30');
  const [regSex, setRegSex] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regComplaint, setRegComplaint] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your Patient ID, Registered Phone number, or Email.');
      return;
    }
    setError(null);
    try {
      const user = AuthService.loginPatient(identifier, password);
      onLoginSuccess(user);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleQuickDemo = (patientId: string) => {
    try {
      const user = AuthService.loginPatient(patientId);
      onLoginSuccess(user);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setRegError('Full Name is required.');
      return;
    }
    if (!regPhone.trim() || regPhone.replace(/\D/g, '').length < 10) {
      setRegError('A valid 10-digit phone number is required.');
      return;
    }

    try {
      const user = AuthService.registerPatient({
        name: regName,
        phone: regPhone,
        email: regEmail,
        age: typeof regAge === 'number' ? regAge : parseInt(regAge, 10) || 30,
        sex: regSex,
        chiefComplaint: regComplaint
      });
      setShowRegisterModal(false);
      onLoginSuccess(user);
    } catch (err) {
      setRegError((err as Error).message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <div className="safety-banner">
        <ShieldCheck size={16} className="safety-banner-icon" />
        <span>
          <strong>Notice:</strong> MedLens organizes and displays medical information. It does not provide medical diagnosis or treatment.
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ alignSelf: 'flex-start', border: 'none', backgroundColor: 'transparent' }}
            onClick={onBackToLanding}
          >
            <ArrowLeft size={16} />
            <span>&larr; Back to Role Selection</span>
          </button>

          <div className="card" style={{ padding: '32px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <User size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Patient Portal Login
                </h1>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                  Access your health records and medical reports
                </p>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{error}</span>
              </div>
            )}

            {infoMessage && (
              <div style={{ padding: '10px 14px', backgroundColor: '#eff6ff', color: '#1e40af', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', marginBottom: '16px' }}>
                {infoMessage}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="patientIdInput">
                  Patient ID, Phone, or Email
                </label>
                <div className="search-container">
                  <User size={16} className="search-icon" />
                  <input
                    id="patientIdInput"
                    type="text"
                    className="search-input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="e.g. ML-2026-1001 or 9820143210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="patientPassword">Password</label>
                  <button
                    type="button"
                    style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'underline' }}
                    onClick={() => setInfoMessage('For demonstration, you can use any password or click a Quick Demo Patient below.')}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="search-container">
                  <Lock size={16} className="search-icon" />
                  <input
                    id="patientPassword"
                    type="password"
                    className="search-input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '6px' }}
                id="btn-patient-login-submit"
              >
                <span>Login to Patient Portal</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => setShowRegisterModal(true)}
                  id="btn-create-patient-account"
                >
                  <UserPlus size={14} />
                  <span>Create Patient Account</span>
                </button>
              </div>
            </form>

            {/* Quick Demo Patients Section */}
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Quick 1-Click Demo Logins:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'space-between', fontSize: '0.8125rem' }}
                  onClick={() => handleQuickDemo('ML-2026-1001')}
                >
                  <span><strong>Ramesh Sharma</strong> (54M, Diabetes & Cough)</span>
                  <span className="patient-id-tag">ML-2026-1001</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'space-between', fontSize: '0.8125rem' }}
                  onClick={() => handleQuickDemo('ML-2026-1004')}
                >
                  <span><strong>Deepika Sundaram</strong> (27F, Anemia)</span>
                  <span className="patient-id-tag">ML-2026-1004</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'space-between', fontSize: '0.8125rem' }}
                  onClick={() => handleQuickDemo('ML-2026-1002')}
                >
                  <span><strong>Priya Patel</strong> (33F, Migraine)</span>
                  <span className="patient-id-tag">ML-2026-1002</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="modal-backdrop" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="card-header">
              <h2 className="card-title">
                <UserPlus size={18} color="var(--primary)" />
                Create New Patient Account
              </h2>
              <button type="button" className="btn btn-icon" onClick={() => setShowRegisterModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {regError && (
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem' }}>
                    {regError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Full Name <span className="form-required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Vikram Sethi"
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Age <span className="form-required">*</span></label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      className="form-input"
                      value={regAge}
                      onChange={(e) => setRegAge(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sex <span className="form-required">*</span></label>
                    <select
                      className="form-select"
                      value={regSex}
                      onChange={(e) => setRegSex(e.target.value as 'Male' | 'Female' | 'Other')}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number (10 digits) <span className="form-required">*</span></label>
                  <input
                    type="tel"
                    className="form-input"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. vikram.sethi@example.in"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Symptoms / Reason for Visit</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={regComplaint}
                    onChange={(e) => setRegComplaint(e.target.value)}
                    placeholder="e.g. Mild lower back stiffness on prolonged sitting"
                  />
                </div>
              </div>

              <div className="card-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegisterModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="btn-submit-patient-register">
                  <CheckCircle2 size={16} />
                  <span>Register & Log In</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
