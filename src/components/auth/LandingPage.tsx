import { User, Stethoscope, Activity, ShieldCheck, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: 'patient' | 'doctor') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Top hospital banner */}
      <div className="safety-banner">
        <ShieldCheck size={16} className="safety-banner-icon" />
        <span>
          <strong>Notice:</strong> This application organizes and summarizes medical information. It does not replace professional medical diagnosis or treatment.
        </span>
      </div>

      {/* Hero Section */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '820px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '36px' }}>
          
          {/* Logo & Headline */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Activity size={32} strokeWidth={2.5} />
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
              MedLens
            </h1>

            <p style={{ fontSize: '1.125rem', color: 'var(--primary)', fontWeight: 600, letterSpacing: '-0.01em' }}>
              AI-powered medical information organization
            </p>

            <p style={{ fontSize: '0.9375rem', color: 'var(--text-subtle)', maxWidth: '520px', lineHeight: 1.6 }}>
              A clean clinical information management system designed for Indian healthcare staff and patients. Collect, structure, and verify medical records.
            </p>
          </div>

          {/* Two Role Options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', width: '100%' }}>
            {/* Patient Option Card */}
            <div
              className="card"
              style={{
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '24px',
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                border: '1px solid var(--border-medium)',
                cursor: 'pointer'
              }}
              onClick={() => onSelectRole('patient')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-medium)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <User size={24} />
                </div>

                <div>
                  <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Patient
                  </h2>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Access your health information and upload medical reports.
                  </p>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'space-between' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRole('patient');
                  }}
                  id="btn-landing-patient-login"
                >
                  <span>Patient Login</span>
                  <ArrowRight size={16} />
                </button>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textAlign: 'center', marginTop: '8px' }}>
                  Self-report symptoms, upload test documents & confirm extractions
                </div>
              </div>
            </div>

            {/* Doctor Option Card */}
            <div
              className="card"
              style={{
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '24px',
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                border: '1px solid var(--border-medium)',
                cursor: 'pointer'
              }}
              onClick={() => onSelectRole('doctor')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-medium)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Stethoscope size={24} />
                </div>

                <div>
                  <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Doctor
                  </h2>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Review patient information, reports, and structured medical records.
                  </p>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'space-between', backgroundColor: '#0f766e' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRole('doctor');
                  }}
                  id="btn-landing-doctor-login"
                >
                  <span>Doctor Login</span>
                  <ArrowRight size={16} />
                </button>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textAlign: 'center', marginTop: '8px' }}>
                  Clinical dashboard, patient directory, two-panel report viewer & verification
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-light)', textAlign: 'center' }}>
            MedLens Healthcare System &bull; Hospital Information Management (HIS) &bull; Apollo OPD Ward 3
          </div>
        </div>
      </div>
    </div>
  );
};
