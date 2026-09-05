import type { Patient } from '../types/patient';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p-1001',
    patientId: 'ML-2026-1001',
    name: 'Ramesh Sharma',
    dateOfBirth: '1972-04-15',
    age: 54,
    sex: 'Male',
    phone: '+91 98201 43210',
    email: 'ramesh.sharma@example.in',
    address: 'Flat 402, Shanti Niketan, Andheri East, Mumbai, Maharashtra - 400069',
    emergencyContact: {
      name: 'Sunita Sharma',
      phone: '+91 98201 43219',
      relation: 'Spouse'
    },
    chiefComplaint: 'Persistent dry cough for 3 weeks and mild chest discomfort on exertion',
    symptoms: [
      {
        id: 'sym-1',
        symptom: 'Dry cough with nocturnal worsening',
        duration: '3 weeks',
        notes: 'Aggravated in cold air, no hemoptysis',
        sourceType: 'USER_PROVIDED'
      },
      {
        id: 'sym-2',
        symptom: 'Exertional dyspnea (mild shortness of breath)',
        duration: '10 days',
        notes: 'Felt when climbing two flights of stairs',
        sourceType: 'USER_PROVIDED'
      }
    ],
    conditions: [
      {
        id: 'cond-1',
        condition: 'Type 2 Diabetes Mellitus',
        diagnosedDate: '2018-06-12',
        notes: 'Under oral hypoglycemic therapy, HbA1c monitored quarterly',
        sourceType: 'USER_PROVIDED'
      },
      {
        id: 'cond-2',
        condition: 'Essential Hypertension',
        diagnosedDate: '2015-02-20',
        notes: 'Well managed on daily ARB blocker',
        sourceType: 'USER_PROVIDED'
      }
    ],
    previousHistory: 'Treated for enteric fever in 2008 with complete recovery. No history of tuberculosis or asthma.',
    allergies: [
      {
        id: 'alg-1',
        allergen: 'Penicillin and Amoxicillin',
        reaction: 'Urticarial rash and facial hives',
        severity: 'severe',
        sourceType: 'USER_PROVIDED'
      }
    ],
    medications: [
      {
        id: 'med-1',
        name: 'Metformin Hydrochloride 500mg',
        frequency: 'Twice daily (after breakfast & dinner)',
        duration: 'Ongoing',
        notes: 'Advised regular renal function tests',
        sourceType: 'USER_PROVIDED'
      },
      {
        id: 'med-2',
        name: 'Telmisartan 40mg',
        frequency: 'Once daily (morning)',
        duration: 'Ongoing',
        notes: 'For blood pressure control',
        sourceType: 'USER_PROVIDED'
      }
    ],
    previousSurgeries: 'Open appendectomy in 2012 at Lilavati Hospital, Mumbai. Uneventful recovery.',
    familyHistory: 'Father had coronary artery disease (angioplasty at age 62). Mother has hypertension.',
    lifestyleInfo: 'Non-smoker, occasional alcohol on social occasions. Vegetarian diet. Sedentary IT office job.',
    reports: [
      {
        reportId: 'rep-1',
        patientId: 'p-1001',
        reportName: 'Chest X-Ray PA View',
        reportType: 'Radiology',
        uploadDate: '2026-03-01T10:30:00.000Z',
        reportDate: '2026-02-28',
        fileReference: 'cxr_ramesh_sharma_20260228.pdf',
        fileSize: '1.8 MB',
        status: 'UPLOADED',
        notes: 'Bilateral lung fields clear, normal cardiothoracic ratio',
        sourceType: 'USER_PROVIDED'
      },
      {
        reportId: 'rep-2',
        patientId: 'p-1001',
        reportName: 'Fasting Blood Glucose & HbA1c Profile',
        reportType: 'Pathology / Biochemistry',
        uploadDate: '2026-03-02T14:15:00.000Z',
        reportDate: '2026-03-01',
        fileReference: 'hba1c_ramesh_20260301.pdf',
        fileSize: '420 KB',
        status: 'PROCESSED',
        notes: 'Processed through optical extraction pipeline',
        sourceType: 'REPORT_EXTRACTED'
      }
    ],
    labResults: [
      {
        id: 'lab-101',
        patientId: 'p-1001',
        sourceReportId: 'rep-2',
        sourceReportName: 'Fasting Blood Glucose & HbA1c Profile',
        testName: 'Fasting Blood Sugar (Glucose)',
        value: '138',
        unit: 'mg/dL',
        referenceRange: '70 - 99',
        status: 'HIGH',
        statusReason: 'Value 138 is above the source reference range (70 – 99).',
        confidence: 0.97,
        confidenceLevel: 'HIGH',
        sourceType: 'REPORT_EXTRACTED',
        verificationStatus: 'CONFIRMED',
        verifiedBy: 'Dr. A. Deshmukh',
        verifiedAt: '2026-03-02T14:30:00.000Z',
        originalExtraction: {
          testName: 'Fasting Blood Sugar (Glucose)',
          value: '138',
          unit: 'mg/dL',
          referenceRange: '70 - 99'
        },
        reportDate: '2026-03-01'
      },
      {
        id: 'lab-102',
        patientId: 'p-1001',
        sourceReportId: 'rep-2',
        sourceReportName: 'Fasting Blood Glucose & HbA1c Profile',
        testName: 'Glycated Hemoglobin (HbA1c)',
        value: '7.1',
        unit: '%',
        referenceRange: '4.0 - 5.6',
        status: 'HIGH',
        statusReason: 'Value 7.1 is above the source reference range (4.0 – 5.6).',
        confidence: 0.96,
        confidenceLevel: 'HIGH',
        sourceType: 'REPORT_EXTRACTED',
        verificationStatus: 'CONFIRMED',
        verifiedBy: 'Dr. A. Deshmukh',
        verifiedAt: '2026-03-02T14:30:00.000Z',
        originalExtraction: {
          testName: 'Glycated Hemoglobin (HbA1c)',
          value: '7.1',
          unit: '%',
          referenceRange: '4.0 - 5.6'
        },
        reportDate: '2026-03-01'
      },
      {
        id: 'lab-103',
        patientId: 'p-1001',
        sourceReportId: 'rep-2',
        sourceReportName: 'Fasting Blood Glucose & HbA1c Profile',
        testName: 'Serum Creatinine',
        value: '1.1',
        unit: 'mg/dL',
        referenceRange: '0.7 - 1.3',
        status: 'NORMAL',
        statusReason: 'Value 1.1 is within the source reference range (0.7 – 1.3).',
        confidence: 0.94,
        confidenceLevel: 'HIGH',
        sourceType: 'REPORT_EXTRACTED',
        verificationStatus: 'CONFIRMED',
        verifiedBy: 'Staff Nurse K. Roy',
        verifiedAt: '2026-03-02T14:35:00.000Z',
        originalExtraction: {
          testName: 'Serum Creatinine',
          value: '1.1',
          unit: 'mg/dL',
          referenceRange: '0.7 - 1.3'
        },
        reportDate: '2026-03-01'
      },
      {
        id: 'lab-104',
        patientId: 'p-1001',
        sourceReportId: 'rep-2',
        sourceReportName: 'Fasting Blood Glucose & HbA1c Profile',
        testName: 'Spot Urine Microalbumin',
        value: '35',
        unit: 'mg/L',
        referenceRange: null,
        status: 'NOT_DETERMINABLE',
        statusReason: 'Reference range not provided in source report. Status cannot be determined from the provided report.',
        confidence: 0.88,
        confidenceLevel: 'HIGH',
        sourceType: 'REPORT_EXTRACTED',
        verificationStatus: 'UNVERIFIED',
        originalExtraction: {
          testName: 'Spot Urine Microalbumin',
          value: '35',
          unit: 'mg/L',
          referenceRange: null
        },
        reportDate: '2026-03-01'
      }
    ],
    timeline: [
      {
        id: 'tl-1',
        patientId: 'p-1001',
        type: 'REGISTRATION',
        timestamp: '2026-02-26T09:15:00.000Z',
        title: 'Patient Registered',
        description: 'New outpatient registration created by Staff Nurse A. Deshmukh',
        sourceType: 'USER_PROVIDED'
      },
      {
        id: 'tl-2',
        patientId: 'p-1001',
        type: 'REPORT_UPLOAD',
        timestamp: '2026-03-01T10:30:00.000Z',
        title: 'Chest X-Ray Uploaded',
        description: 'Uploaded Chest X-Ray PA View from Apollo Diagnostic Center',
        sourceType: 'USER_PROVIDED'
      },
      {
        id: 'tl-3',
        patientId: 'p-1001',
        type: 'REPORT_UPLOAD',
        timestamp: '2026-03-02T14:15:00.000Z',
        title: 'Laboratory Report Added',
        description: 'Uploaded Fasting Blood Glucose & HbA1c report with 4 extracted tests',
        sourceType: 'REPORT_EXTRACTED'
      },
      {
        id: 'tl-4',
        patientId: 'p-1001',
        type: 'HUMAN_VERIFICATION',
        timestamp: '2026-03-02T14:30:00.000Z',
        title: 'Laboratory Tests Verified',
        description: 'Dr. A. Deshmukh verified 3 extracted test results against the source lab sheet',
        sourceType: 'USER_PROVIDED'
      }
    ],
    createdAt: '2026-02-26T09:15:00.000Z',
    updatedAt: '2026-03-02T14:30:00.000Z'
  },
  {
    id: 'p-1002',
    patientId: 'ML-2026-1002',
    name: 'Priya Patel',
    dateOfBirth: '1993-08-22',
    age: 33,
    sex: 'Female',
    phone: '+91 94280 11223',
    email: 'priya.patel93@example.in',
    address: 'B-12, Green Acres Society, Navrangpura, Ahmedabad, Gujarat - 380009',
    emergencyContact: {
      name: 'Bhavesh Patel',
      phone: '+91 94280 99887',
      relation: 'Brother'
    },
    chiefComplaint: 'Severe recurrent throbbing headaches with photophobia and nausea',
    symptoms: [
      {
        id: 'sym-3',
        symptom: 'Throbbing hemicranial headache',
        duration: '4 days per episode',
        notes: 'Usually starts in left temporal area, preceded by visual scintillations',
        sourceType: 'USER_PROVIDED'
      },
      {
        id: 'sym-4',
        symptom: 'Photophobia and sound sensitivity',
        duration: 'During headache episodes',
        notes: 'Requires resting in a dark quiet room',
        sourceType: 'USER_PROVIDED'
      }
    ],
    conditions: [
      {
        id: 'cond-3',
        condition: 'Migraine with Aura',
        diagnosedDate: '2021-11-05',
        notes: 'Frequency increased in the last 2 months due to screen exposure',
        sourceType: 'USER_PROVIDED'
      }
    ],
    previousHistory: 'No major childhood illnesses. No history of seizures or head trauma.',
    allergies: [
      {
        id: 'alg-2',
        allergen: 'Sulfonamides (Sulfa drugs)',
        reaction: 'Severe angioedema and lip swelling',
        severity: 'severe',
        sourceType: 'USER_PROVIDED'
      }
    ],
    medications: [
      {
        id: 'med-3',
        name: 'Naproxen 500mg',
        frequency: 'As needed at symptom onset (max 2 tabs/day)',
        duration: 'SOS during attacks',
        notes: 'Take with food to minimize gastric irritation',
        sourceType: 'USER_PROVIDED'
      }
    ],
    previousSurgeries: 'None reported.',
    familyHistory: 'Maternal aunt has chronic migraine. Mother has thyroid disorder (hypothyroidism).',
    lifestyleInfo: 'Architect, high screen time (10+ hours/day). Regular tea drinker (3 cups/day).',
    reports: [
      {
        reportId: 'rep-3',
        patientId: 'p-1002',
        reportName: 'Brain MRI Screening with Diffusion',
        reportType: 'Radiology / Neuroimaging',
        uploadDate: '2026-02-27T16:00:00.000Z',
        reportDate: '2026-02-26',
        fileReference: 'mri_brain_priya_20260226.pdf',
        fileSize: '3.4 MB',
        status: 'PROCESSED',
        notes: 'Normal intracranial study without acute infarct, hemorrhage or space occupying lesion',
        sourceType: 'USER_PROVIDED'
      }
    ],
    labResults: [],
    timeline: [
      {
        id: 'tl-5',
        patientId: 'p-1002',
        type: 'REGISTRATION',
        timestamp: '2026-02-27T15:30:00.000Z',
        title: 'Patient Intake Completed',
        description: 'Registered at Neurology OPD desk',
        sourceType: 'USER_PROVIDED'
      }
    ],
    createdAt: '2026-02-27T15:30:00.000Z',
    updatedAt: '2026-02-27T16:00:00.000Z'
  },
  {
    id: 'p-1003',
    patientId: 'ML-2026-1003',
    name: 'Anand Kumar Verma',
    dateOfBirth: '1958-11-04',
    age: 67,
    sex: 'Male',
    phone: '+91 97110 55443',
    email: 'ak.verma58@example.in',
    address: 'House 54, Sector 14, Gurugram, Haryana - 122001',
    emergencyContact: {
      name: 'Rohit Verma',
      phone: '+91 97110 55444',
      relation: 'Son'
    },
    chiefComplaint: 'Bilateral knee pain, crepitus, and morning stiffness lasting 30 minutes',
    symptoms: [
      {
        id: 'sym-5',
        symptom: 'Mechanical bilateral knee pain',
        duration: '8 months',
        notes: 'Right knee worse than left, aggravated by stair climbing and prolonged standing',
        sourceType: 'USER_PROVIDED'
      }
    ],
    conditions: [
      {
        id: 'cond-4',
        condition: 'Bilateral Knee Osteoarthritis',
        diagnosedDate: '2022-03-10',
        notes: 'Under conservative management with physiotherapy and analgesics',
        sourceType: 'USER_PROVIDED'
      }
    ],
    previousHistory: 'Mild lumbar spondylosis diagnosed in 2017.',
    allergies: [],
    medications: [
      {
        id: 'med-5',
        name: 'Paracetamol 650mg',
        frequency: 'As needed for joint pain',
        duration: 'SOS',
        notes: 'First line analgesic',
        sourceType: 'USER_PROVIDED'
      }
    ],
    previousSurgeries: 'Right cataract phacoemulsification (2023).',
    familyHistory: 'No history of rheumatoid arthritis.',
    lifestyleInfo: 'Retired school principal. Daily flat surface walking.',
    reports: [],
    labResults: [],
    timeline: [
      {
        id: 'tl-7',
        patientId: 'p-1003',
        type: 'REGISTRATION',
        timestamp: '2026-03-02T10:45:00.000Z',
        title: 'Orthopedic Intake Completed',
        description: 'New registration at Orthopedics Department OPD',
        sourceType: 'USER_PROVIDED'
      }
    ],
    createdAt: '2026-03-02T10:45:00.000Z',
    updatedAt: '2026-03-02T11:00:00.000Z'
  },
  {
    id: 'p-1004',
    patientId: 'ML-2026-1004',
    name: 'Deepika Sundaram',
    dateOfBirth: '1998-12-10',
    age: 27,
    sex: 'Female',
    phone: '+91 98402 77665',
    email: 'deepika.sundaram@example.in',
    address: 'Plot 28, Anna Nagar West Extension, Chennai, Tamil Nadu - 600101',
    emergencyContact: {
      name: 'V. Sundaram',
      phone: '+91 98402 77660',
      relation: 'Father'
    },
    chiefComplaint: 'Chronic fatigue, lethargy, dizziness on standing, and poor concentration',
    symptoms: [
      {
        id: 'sym-7',
        symptom: 'Generalized persistent exhaustion',
        duration: '2 months',
        notes: 'Unrelieved by nocturnal sleep',
        sourceType: 'USER_PROVIDED'
      }
    ],
    conditions: [
      {
        id: 'cond-6',
        condition: 'Microcytic Hypochromic Anemia (Iron Deficiency)',
        diagnosedDate: '2026-02-20',
        notes: 'Hemoglobin 8.8 g/dL, low serum ferritin levels',
        sourceType: 'USER_PROVIDED'
      }
    ],
    previousHistory: 'Heavy menstrual bleeding (menorrhagia) reported.',
    allergies: [],
    medications: [
      {
        id: 'med-8',
        name: 'Ferrous Ascorbate 100mg + Folic Acid 1.5mg',
        frequency: 'Once daily after lunch',
        duration: '3 months course',
        notes: 'Avoid consuming along with dairy or tea',
        sourceType: 'USER_PROVIDED'
      }
    ],
    previousSurgeries: 'No prior surgeries.',
    familyHistory: 'No family history of thalassemia.',
    lifestyleInfo: 'Software engineer, vegetarian diet.',
    reports: [
      {
        reportId: 'rep-5',
        patientId: 'p-1004',
        reportName: 'Complete Hemogram & Iron Profile',
        reportType: 'Hematology / Pathology',
        uploadDate: '2026-02-25T11:20:00.000Z',
        reportDate: '2026-02-24',
        fileReference: 'hemogram_deepika_20260224.pdf',
        fileSize: '512 KB',
        status: 'PROCESSED',
        notes: 'Processed through optical extraction pipeline',
        sourceType: 'REPORT_EXTRACTED'
      }
    ],
    labResults: [
      {
        id: 'lab-201',
        patientId: 'p-1004',
        sourceReportId: 'rep-5',
        sourceReportName: 'Complete Hemogram & Iron Profile',
        testName: 'Hemoglobin',
        value: '8.8',
        unit: 'g/dL',
        referenceRange: '12.0 - 15.5',
        status: 'LOW',
        statusReason: 'Value 8.8 is below the source reference range (12.0 – 15.5).',
        confidence: 0.98,
        confidenceLevel: 'HIGH',
        sourceType: 'REPORT_EXTRACTED',
        verificationStatus: 'CONFIRMED',
        verifiedBy: 'Dr. V. Nambiar',
        verifiedAt: '2026-02-25T11:45:00.000Z',
        originalExtraction: {
          testName: 'Hemoglobin',
          value: '8.8',
          unit: 'g/dL',
          referenceRange: '12.0 - 15.5'
        },
        reportDate: '2026-02-24'
      },
      {
        id: 'lab-202',
        patientId: 'p-1004',
        sourceReportId: 'rep-5',
        sourceReportName: 'Complete Hemogram & Iron Profile',
        testName: 'Serum Ferritin',
        value: '8',
        unit: 'ng/mL',
        referenceRange: '15 - 150',
        status: 'LOW',
        statusReason: 'Value 8 is below the source reference range (15 – 150).',
        confidence: 0.94,
        confidenceLevel: 'HIGH',
        sourceType: 'REPORT_EXTRACTED',
        verificationStatus: 'CONFIRMED',
        verifiedBy: 'Dr. V. Nambiar',
        verifiedAt: '2026-02-25T11:45:00.000Z',
        originalExtraction: {
          testName: 'Serum Ferritin',
          value: '8',
          unit: 'ng/mL',
          referenceRange: '15 - 150'
        },
        reportDate: '2026-02-24'
      },
      {
        id: 'lab-203',
        patientId: 'p-1004',
        sourceReportId: 'rep-5',
        sourceReportName: 'Complete Hemogram & Iron Profile',
        testName: 'Total Iron Binding Capacity (TIBC)',
        value: '420',
        unit: 'ug/dL',
        referenceRange: '250 - 400',
        status: 'HIGH',
        statusReason: 'Value 420 is above the source reference range (250 – 400).',
        confidence: 0.91,
        confidenceLevel: 'HIGH',
        sourceType: 'REPORT_EXTRACTED',
        verificationStatus: 'CONFIRMED',
        verifiedBy: 'Dr. V. Nambiar',
        verifiedAt: '2026-02-25T11:45:00.000Z',
        originalExtraction: {
          testName: 'Total Iron Binding Capacity (TIBC)',
          value: '420',
          unit: 'ug/dL',
          referenceRange: '250 - 400'
        },
        reportDate: '2026-02-24'
      }
    ],
    timeline: [
      {
        id: 'tl-9',
        patientId: 'p-1004',
        type: 'REGISTRATION',
        timestamp: '2026-02-25T11:00:00.000Z',
        title: 'Patient Registered',
        description: 'Initial consultation intake recorded at Internal Medicine OPD',
        sourceType: 'USER_PROVIDED'
      },
      {
        id: 'tl-10',
        patientId: 'p-1004',
        type: 'REPORT_UPLOAD',
        timestamp: '2026-02-25T11:20:00.000Z',
        title: 'Hematology Reports Added',
        description: 'Complete Hemogram and Serum Ferritin profile attached',
        sourceType: 'REPORT_EXTRACTED'
      }
    ],
    createdAt: '2026-02-25T11:00:00.000Z',
    updatedAt: '2026-02-25T11:45:00.000Z'
  }
];
