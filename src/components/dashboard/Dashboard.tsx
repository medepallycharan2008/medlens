import { useState } from 'react';
import type { Patient } from '../../types/patient';
import { PatientService } from '../../services/patientService';
import type { NavTab } from '../layout/Sidebar';
import {
  Users,
  UserPlus,
  FileText,
  Clock,
  Search,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
  setActiveTab: (tab: NavTab) => void;
  onSelectPatient: (patientId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  patients,
  setActiveTab,
  onSelectPatient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const metrics = PatientService.getDashboardMetrics(patients);

  const searchResults = searchQuery.trim()
    ? PatientService.filterAndSortPatients(patients, { searchQuery })
    : [];

  const handleOpenPatient = (id: string) => {
    onSelectPatient(id);
    setActiveTab('patient_records');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header section with Add Patient button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="section-title">Clinical Overview</h1>
          <p className="section-subtitle">
            Organized medical records for OPD and inpatient wards
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => setActiveTab('add_patient')}
          id="dash-btn-add-patient"
        >
          <UserPlus size={18} />
          <span>+ Add New Patient</span>
        </button>
      </div>

      {/* Global Quick Search */}
      <div className="card" style={{ padding: '16px 20px', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="dashboard-search" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Search Patient Directory
          </label>
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              id="dashboard-search"
              type="text"
              className="search-input"
              placeholder="Search by Patient Name, Patient ID (e.g. ML-2026-1001), or Phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchQuery.trim() && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)', marginBottom: '8px' }}>
                Found {searchResults.length} matching {searchResults.length === 1 ? 'patient' : 'patients'}:
              </div>
              {searchResults.length === 0 ? (
                <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-subtle)' }}>
                  No matching patients found for "{searchQuery}". Check the patient ID or phone number.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {searchResults.slice(0, 5).map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleOpenPatient(p.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-app)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-light)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-app)')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="patient-id-tag">{p.patientId}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                          {p.age} yrs &bull; {p.sex} &bull; {p.phone}
                        </span>
                      </div>
                      <ChevronRight size={16} color="var(--primary)" />
                    </div>
                  ))}
                  {searchResults.length > 5 && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveTab('patients')}
                      style={{ alignSelf: 'flex-start', marginTop: '4px' }}
                    >
                      View all {searchResults.length} results in Patient List &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4 Metric Cards (Section 4 Requirements) */}
      <div className="metrics-grid">
        <div className="stat-card">
          <div>
            <div className="stat-card-title">Total Patients</div>
            <div className="stat-card-value">{metrics.totalPatients}</div>
            <div className="stat-card-desc">Active in system</div>
          </div>
          <div className="stat-icon-wrapper">
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-card-title">Recently Added</div>
            <div className="stat-card-value">{metrics.recentlyAdded}</div>
            <div className="stat-card-desc">Registered in last 7 days</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <UserPlus size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-card-title">With Uploaded Reports</div>
            <div className="stat-card-value">{metrics.withReports}</div>
            <div className="stat-card-desc">Lab or radiology files attached</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>
            <FileText size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-card-title">Recently Updated</div>
            <div className="stat-card-value">{metrics.recentlyUpdated}</div>
            <div className="stat-card-desc">Updates in last 7 days</div>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Recent Patients Table / Cards */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Clock size={18} color="var(--primary)" />
              Recently Updated Records
            </h2>
            <p className="card-subtitle">Patients with recent consultations, report uploads, or clinical notes</p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('patients')}
          >
            <span>View All Patients</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {metrics.recentPatients.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-subtle)' }}>
              No patient records available yet. Click <strong>+ Add New Patient</strong> to register your first patient.
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Age / Sex</th>
                    <th>Chief Complaint</th>
                    <th>Reports</th>
                    <th>Last Updated</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentPatients.map((patient) => {
                    const formattedDate = new Date(patient.updatedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <tr key={patient.id} onClick={() => handleOpenPatient(patient.id)}>
                        <td>
                          <span className="patient-id-tag">{patient.patientId}</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{patient.name}</td>
                        <td>
                          {patient.age} yrs &bull; {patient.sex}
                        </td>
                        <td style={{ maxWidth: '280px' }} className="text-truncate" title={patient.chiefComplaint || 'None'}>
                          {patient.chiefComplaint || <span style={{ color: 'var(--text-light)' }}>No chief complaint</span>}
                        </td>
                        <td>
                          {patient.reports && patient.reports.length > 0 ? (
                            <span className="badge badge-source">
                              <FileText size={11} />
                              {patient.reports.length} {patient.reports.length === 1 ? 'Report' : 'Reports'}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-light)', fontSize: '0.8125rem' }}>None</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-subtle)', fontSize: '0.8125rem' }}>
                          {formattedDate}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPatient(patient.id);
                            }}
                          >
                            Open Profile
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
    </div>
  );
};
