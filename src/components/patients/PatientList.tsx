import { useState } from 'react';
import type { Patient, PatientFilters } from '../../types/patient';
import { PatientService } from '../../services/patientService';
import type { NavTab } from '../layout/Sidebar';
import { EmptyState } from '../common/EmptyState';
import {
  Search,
  Filter,
  UserPlus,
  Users,
  FileText,
  Phone,
  Eye,
  Edit2,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onEditPatient: (patient: Patient) => void;
  setActiveTab: (tab: NavTab) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  onSelectPatient,
  onEditPatient,
  setActiveTab
}) => {
  const [filters, setFilters] = useState<PatientFilters>({
    searchQuery: '',
    sex: 'All',
    hasReports: undefined,
    sortBy: 'recent_updated'
  });

  const filteredPatients = PatientService.filterAndSortPatients(patients, filters);

  const handlePatientClick = (patientId: string) => {
    onSelectPatient(patientId);
    setActiveTab('patient_records');
  };

  const handleEditClick = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    onEditPatient(patient);
    setActiveTab('add_patient');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="section-title">Patient Directory</h1>
          <p className="section-subtitle">
            Showing {filteredPatients.length} of {patients.length} registered patients
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setActiveTab('add_patient')}
          id="list-btn-add-patient"
        >
          <UserPlus size={16} />
          <span>+ Add Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Main search field */}
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by Patient Name, ID, or Phone number..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              id="patient-search-input"
            />
          </div>

          {/* Controls Bar: Filters and Sorters */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                <Filter size={14} />
                <span>Filter:</span>
              </div>

              {/* Sex Filter */}
              <select
                className="form-select"
                style={{ width: 'auto', minHeight: '34px', padding: '6px 12px', fontSize: '0.8125rem' }}
                value={filters.sex || 'All'}
                onChange={(e) => setFilters(prev => ({ ...prev, sex: e.target.value }))}
                aria-label="Filter by sex"
              >
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              {/* Reports Filter */}
              <select
                className="form-select"
                style={{ width: 'auto', minHeight: '34px', padding: '6px 12px', fontSize: '0.8125rem' }}
                value={filters.hasReports === undefined ? 'All' : filters.hasReports ? 'WithReports' : 'NoReports'}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters(prev => ({
                    ...prev,
                    hasReports: val === 'All' ? undefined : val === 'WithReports'
                  }));
                }}
                aria-label="Filter by reports"
              >
                <option value="All">All Records</option>
                <option value="WithReports">With Uploaded Reports</option>
                <option value="NoReports">No Reports</option>
              </select>

              {(filters.searchQuery || filters.sex !== 'All' || filters.hasReports !== undefined) && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setFilters({ searchQuery: '', sex: 'All', hasReports: undefined, sortBy: 'recent_updated' })}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Sort Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={14} color="var(--text-subtle)" />
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>Sort:</span>
              <select
                className="form-select"
                style={{ width: 'auto', minHeight: '34px', padding: '6px 12px', fontSize: '0.8125rem' }}
                value={filters.sortBy || 'recent_updated'}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as PatientFilters['sortBy'] }))}
                aria-label="Sort patients"
              >
                <option value="recent_updated">Recently Updated</option>
                <option value="recent_created">Recently Registered</option>
                <option value="name_asc">Name (A &rarr; Z)</option>
                <option value="age_asc">Age (Ascending)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List Content */}
      {filteredPatients.length === 0 ? (
        patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Patients Registered"
            description="Get started by registering a new patient into the MedLens information system."
            actionText="+ Add First Patient"
            onAction={() => setActiveTab('add_patient')}
          />
        ) : (
          <EmptyState
            icon={Search}
            title="No Results Found"
            description={`No patient records match the criteria "${filters.searchQuery || 'current filters'}". Try clearing filters or searching with a different term.`}
            actionText="Reset Filters"
            onAction={() => setFilters({ searchQuery: '', sex: 'All', hasReports: undefined, sortBy: 'recent_updated' })}
          />
        )
      ) : (
        <>
          {/* Desktop Table View (Hidden on mobile via CSS query) */}
          <div className="table-wrapper" style={{ display: 'block' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Sex</th>
                  <th>Phone</th>
                  <th>Last Updated</th>
                  <th>Reports</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => {
                  const updatedStr = new Date(patient.updatedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr
                      key={patient.id}
                      onClick={() => handlePatientClick(patient.id)}
                      title="Click to view structured profile"
                    >
                      <td>
                        <span className="patient-id-tag">{patient.patientId}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{patient.name}</div>
                        {patient.chiefComplaint && (
                          <div
                            style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', maxWidth: '240px' }}
                            className="text-truncate"
                          >
                            {patient.chiefComplaint}
                          </div>
                        )}
                      </td>
                      <td>{patient.age}</td>
                      <td>{patient.sex}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{patient.phone}</td>
                      <td style={{ color: 'var(--text-subtle)', fontSize: '0.8125rem' }}>{updatedStr}</td>
                      <td>
                        {patient.reports && patient.reports.length > 0 ? (
                          <span className="badge badge-source">
                            <FileText size={11} />
                            {patient.reports.length}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-light)', fontSize: '0.8125rem' }}>0</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => handleEditClick(e, patient)}
                            title="Edit patient details"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePatientClick(patient.id);
                            }}
                            title="Open patient profile"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards Container (Visible on mobile screens) */}
          <div className="mobile-cards-list" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
            {filteredPatients.map((patient) => {
              const updatedStr = new Date(patient.updatedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div
                  key={patient.id}
                  className="patient-card-mobile"
                  onClick={() => handlePatientClick(patient.id)}
                >
                  <div className="patient-card-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="patient-id-tag">{patient.patientId}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          {patient.sex} &bull; {patient.age} yrs
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {patient.name}
                      </h3>
                    </div>
                    <ChevronRight size={18} color="var(--primary)" />
                  </div>

                  {patient.chiefComplaint && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <strong>Complaint:</strong> {patient.chiefComplaint}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '8px', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} />
                      <span>{patient.phone}</span>
                    </div>
                    <div>Updated: {updatedStr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
