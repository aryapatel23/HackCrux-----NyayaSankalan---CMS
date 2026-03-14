import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.accessLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.documentRequest.deleteMany();
  await prisma.courtAction.deleteMany();
  await prisma.acknowledgement.deleteMany();
  await prisma.courtSubmission.deleteMany();
  await prisma.bailRecord.deleteMany();
  await prisma.documentChecklist.deleteMany();
  await prisma.document.deleteMany();
  await prisma.witness.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.investigationEvent.deleteMany();
  await prisma.accused.deleteMany();
  await prisma.caseAssignment.deleteMany();
  await prisma.caseStateHistory.deleteMany();
  await prisma.currentCaseState.deleteMany();
  await prisma.caseReopenRequest.deleteMany();
  await prisma.case.deleteMany();
  await prisma.fir.deleteMany();
  await prisma.user.deleteMany();
  await prisma.court.deleteMany();
  await prisma.policeStation.deleteMany();
  console.log('✅ Existing data cleared!');

  // Create Police Stations
  console.log('Creating police stations...');
  const station1 = await prisma.policeStation.create({
    data: {
      name: 'Central Police Station',
      district: 'Central',
      state: 'Karnataka',
    },
  });

  const station2 = await prisma.policeStation.create({
    data: {
      name: 'North Police Station',
      district: 'North',
      state: 'Karnataka',
    },
  });

  // Create Courts
  console.log('Creating courts...');
  const court1 = await prisma.court.create({
    data: {
      name: 'District Court - Central',
      courtType: 'MAGISTRATE',
      district: 'Central',
      state: 'Karnataka',
    },
  });

  const court2 = await prisma.court.create({
    data: {
      name: 'High Court - State',
      courtType: 'HIGH_COURT',
      district: 'State',
      state: 'Karnataka',
    },
  });

  // Create Users
  console.log('Creating users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // SHO for Central Station
  const sho1 = await prisma.user.create({
    data: {
      email: 'sho.central@police.gov',
      name: 'Rajesh Kumar (SHO)',
      phone: '9876543210',
      role: 'SHO',
      organizationType: 'POLICE_STATION',
      organizationId: station1.id,
      isActive: true,
    },
  });

  // Police Officers for Central Station
  const police1 = await prisma.user.create({
    data: {
      email: 'officer1@police.gov',
      name: 'Priya Sharma (Police Officer)',
      phone: '9876543211',
      role: 'POLICE',
      organizationType: 'POLICE_STATION',
      organizationId: station1.id,
      isActive: true,
    },
  });

  const police2 = await prisma.user.create({
    data: {
      email: 'officer2@police.gov',
      name: 'Amit Patel (Police Officer)',
      phone: '9876543212',
      role: 'POLICE',
      organizationType: 'POLICE_STATION',
      organizationId: station1.id,
      isActive: true,
    },
  });

  // SHO for North Station
  const sho2 = await prisma.user.create({
    data: {
      email: 'sho.north@police.gov',
      name: 'Suresh Reddy (SHO)',
      phone: '9876543213',
      role: 'SHO',
      organizationType: 'POLICE_STATION',
      organizationId: station2.id,
      isActive: true,
    },
  });

  // Court Clerk
  const clerk = await prisma.user.create({
    data: {
      email: 'clerk@court.gov',
      name: 'Anita Desai (Court Clerk)',
      phone: '9876543214',
      role: 'COURT_CLERK',
      organizationType: 'COURT',
      organizationId: court1.id,
      isActive: true,
    },
  });

  // Judge
  const judge = await prisma.user.create({
    data: {
      email: 'judge@court.gov',
      name: 'Justice M. S. Singh',
      phone: '9876543215',
      role: 'JUDGE',
      organizationType: 'COURT',
      organizationId: court1.id,
      isActive: true,
    },
  });

  // Create FIRs
  console.log('Creating FIRs...');
  const fir1 = await prisma.fir.create({
    data: {
      firNumber: 'FIR/2025/0001',
      firSource: 'POLICE',
      registeredBy: police1.id,
      policeStationId: station1.id,
      incidentDate: new Date('2025-01-15'),
      sectionsApplied: 'IPC 302, 201',
      firDocumentUrl: 'https://example.com/fir-001.pdf',
      createdAt: new Date('2025-01-15'),
    },
  });

  const fir2 = await prisma.fir.create({
    data: {
      firNumber: 'FIR/2025/0002',
      firSource: 'POLICE',
      registeredBy: police2.id,
      policeStationId: station1.id,
      incidentDate: new Date('2025-02-10'),
      sectionsApplied: 'IPC 379, 411',
      firDocumentUrl: 'https://example.com/fir-002.pdf',
      createdAt: new Date('2025-02-10'),
    },
  });

  const fir3 = await prisma.fir.create({
    data: {
      firNumber: 'FIR/2025/0003',
      firSource: 'COURT_ORDER',
      registeredBy: sho2.id,
      policeStationId: station2.id,
      incidentDate: new Date('2025-03-05'),
      sectionsApplied: 'IPC 420, 120B',
      firDocumentUrl: 'https://example.com/fir-003.pdf',
      createdAt: new Date('2025-03-05'),
    },
  });

  // Create Cases
  console.log('Creating cases...');
  const case1 = await prisma.case.create({
    data: {
      firId: fir1.id,
      createdAt: new Date('2025-01-15'),
      isArchived: false,
    },
  });

  const case2 = await prisma.case.create({
    data: {
      firId: fir2.id,
      createdAt: new Date('2025-02-10'),
      isArchived: false,
    },
  });

  const case3 = await prisma.case.create({
    data: {
      firId: fir3.id,
      createdAt: new Date('2025-03-05'),
      isArchived: false,
      closureReportUrl: 'https://example.com/closure-003.pdf',
    },
  });

  // Create Case States
  console.log('Creating case states...');
  await prisma.currentCaseState.create({
    data: {
      caseId: case1.id,
      currentState: 'UNDER_INVESTIGATION',
      updatedAt: new Date('2025-01-16'),
    },
  });

  await prisma.currentCaseState.create({
    data: {
      caseId: case2.id,
      currentState: 'CHARGE_SHEET_PREPARED',
      updatedAt: new Date('2025-03-20'),
    },
  });

  await prisma.currentCaseState.create({
    data: {
      caseId: case3.id,
      currentState: 'CLOSURE_REPORT_PREPARED',
      updatedAt: new Date('2025-04-10'),
    },
  });

  // Create Case State History
  console.log('Creating case state history...');
  await prisma.caseStateHistory.createMany({
    data: [
      {
        caseId: case1.id,
        fromState: 'FIR_REGISTERED',
        toState: 'CASE_ASSIGNED',
        changedBy: sho1.id,
        changeReason: 'Case assigned to investigating officer',
        changedAt: new Date('2025-01-15'),
      },
      {
        caseId: case1.id,
        fromState: 'CASE_ASSIGNED',
        toState: 'UNDER_INVESTIGATION',
        changedBy: police1.id,
        changeReason: 'Investigation started',
        changedAt: new Date('2025-01-16'),
      },
      {
        caseId: case2.id,
        fromState: 'FIR_REGISTERED',
        toState: 'CASE_ASSIGNED',
        changedBy: sho1.id,
        changeReason: 'Case assigned',
        changedAt: new Date('2025-02-10'),
      },
      {
        caseId: case2.id,
        fromState: 'CASE_ASSIGNED',
        toState: 'UNDER_INVESTIGATION',
        changedBy: police2.id,
        changeReason: 'Investigation commenced',
        changedAt: new Date('2025-02-11'),
      },
      {
        caseId: case2.id,
        fromState: 'UNDER_INVESTIGATION',
        toState: 'INVESTIGATION_COMPLETED',
        changedBy: police2.id,
        changeReason: 'All evidence collected',
        changedAt: new Date('2025-03-15'),
      },
      {
        caseId: case2.id,
        fromState: 'INVESTIGATION_COMPLETED',
        toState: 'CHARGE_SHEET_PREPARED',
        changedBy: sho1.id,
        changeReason: 'Charge sheet finalized',
        changedAt: new Date('2025-03-20'),
      },
    ],
  });

  // Create Case Assignments
  console.log('Creating case assignments...');
  await prisma.caseAssignment.createMany({
    data: [
      {
        caseId: case1.id,
        assignedTo: police1.id,
        assignedBy: sho1.id,
        assignmentReason: 'Primary investigating officer',
        assignedAt: new Date('2025-01-15'),
      },
      {
        caseId: case2.id,
        assignedTo: police2.id,
        assignedBy: sho1.id,
        assignmentReason: 'Theft investigation specialist',
        assignedAt: new Date('2025-02-10'),
      },
      {
        caseId: case3.id,
        assignedTo: sho2.id,
        assignedBy: sho2.id,
        assignmentReason: 'SHO handling court order case',
        assignedAt: new Date('2025-03-05'),
      },
    ],
  });

  // Create Accused
  console.log('Creating accused records...');
  const accused1 = await prisma.accused.create({
    data: {
      caseId: case1.id,
      name: 'Ravi Varma',
      status: 'ARRESTED',
    },
  });

  const accused2 = await prisma.accused.create({
    data: {
      caseId: case1.id,
      name: 'Mohan Lal',
      status: 'ABSCONDING',
    },
  });

  const accused3 = await prisma.accused.create({
    data: {
      caseId: case2.id,
      name: 'Sunil Choudhary',
      status: 'ON_BAIL',
    },
  });

  // Create Investigation Events
  console.log('Creating investigation events...');
  await prisma.investigationEvent.createMany({
    data: [
      {
        caseId: case1.id,
        eventType: 'SEARCH',
        description: 'Searched suspect residence at Block 12, Sector 5',
        performedBy: police1.id,
        eventDate: new Date('2025-01-17'),
      },
      {
        caseId: case1.id,
        eventType: 'SEIZURE',
        description: 'Seized murder weapon (knife) and bloodstained clothes',
        performedBy: police1.id,
        eventDate: new Date('2025-01-17'),
      },
      {
        caseId: case1.id,
        eventType: 'STATEMENT',
        description: 'Recorded statement of eyewitness Mr. Ramesh',
        performedBy: police1.id,
        eventDate: new Date('2025-01-18'),
      },
      {
        caseId: case2.id,
        eventType: 'SEARCH',
        description: 'Searched local pawn shop for stolen goods',
        performedBy: police2.id,
        eventDate: new Date('2025-02-12'),
      },
      {
        caseId: case2.id,
        eventType: 'SEIZURE',
        description: 'Recovered stolen jewelry worth Rs. 2.5 lakhs',
        performedBy: police2.id,
        eventDate: new Date('2025-02-12'),
      },
    ],
  });

  // Create Evidence
  console.log('Creating evidence records...');
  await prisma.evidence.createMany({
    data: [
      {
        caseId: case1.id,
        category: 'PHOTO',
        fileUrl: 'https://example.com/evidence/case1-crime-scene.jpg',
        uploadedBy: police1.id,
        uploadedAt: new Date('2025-01-17'),
      },
      {
        caseId: case1.id,
        category: 'FORENSIC',
        fileUrl: 'https://example.com/evidence/case1-forensic-report.pdf',
        uploadedBy: police1.id,
        uploadedAt: new Date('2025-01-20'),
      },
      {
        caseId: case2.id,
        category: 'PHOTO',
        fileUrl: 'https://example.com/evidence/case2-stolen-items.jpg',
        uploadedBy: police2.id,
        uploadedAt: new Date('2025-02-12'),
      },
    ],
  });

  // Create Witnesses
  console.log('Creating witness records...');
  await prisma.witness.createMany({
    data: [
      {
        caseId: case1.id,
        name: 'Ramesh Kumar',
        contact: '9876501234',
        address: '123, MG Road, Bangalore',
        statementFileUrl: 'https://example.com/witness/case1-witness1.pdf',
      },
      {
        caseId: case1.id,
        name: 'Lakshmi Devi',
        contact: '9876501235',
        address: '456, Brigade Road, Bangalore',
        statementFileUrl: 'https://example.com/witness/case1-witness2.pdf',
      },
      {
        caseId: case2.id,
        name: 'Vijay Singh',
        contact: '9876501236',
        address: '789, Church Street, Bangalore',
        statementFileUrl: null,
      },
    ],
  });

  // Create Documents
  console.log('Creating documents...');
  await prisma.document.createMany({
    data: [
      {
        caseId: case2.id,
        documentType: 'CHARGE_SHEET',
        version: 1,
        status: 'FINAL',
        contentJson: {
          title: 'Charge Sheet - FIR/2025/0002',
          accused: 'Sunil Choudhary',
          sections: 'IPC 379, 411',
          summary: 'Accused involved in theft and possession of stolen property',
        },
        createdBy: sho1.id,
        createdAt: new Date('2025-03-20'),
      },
      {
        caseId: case3.id,
        documentType: 'CLOSURE_REPORT',
        version: 1,
        status: 'FINAL',
        contentJson: {
          title: 'Closure Report - FIR/2025/0003',
          reason: 'Insufficient evidence to proceed',
          recommendation: 'Case to be closed',
        },
        createdBy: sho2.id,
        createdAt: new Date('2025-04-10'),
      },
    ],
  });

  // Create Bail Records
  console.log('Creating bail records...');
  await prisma.bailRecord.create({
    data: {
      caseId: case2.id,
      accusedId: accused3.id,
      bailType: 'COURT',
      status: 'GRANTED',
      orderDocumentUrl: 'https://example.com/bail/case2-bail-order.pdf',
      createdAt: new Date('2025-02-20'),
    },
  });

  // Create Court Submissions
  console.log('Creating court submissions...');
  const submission1 = await prisma.courtSubmission.create({
    data: {
      caseId: case2.id,
      submissionVersion: 1,
      submittedBy: sho1.id,
      courtId: court1.id,
      submittedAt: new Date('2025-03-25'),
      status: 'SUBMITTED',
    },
  });

  // Create Acknowledgement
  await prisma.acknowledgement.create({
    data: {
      submissionId: submission1.id,
      ackNumber: 'ACK/2025/0001',
      ackTime: new Date('2025-03-25T10:30:00'),
    },
  });

  // Create Document Requests
  console.log('Creating document requests...');
  await prisma.documentRequest.createMany({
    data: [
      {
        caseId: case1.id,
        requestedBy: police1.id,
        approvedBy: sho1.id,
        issuedBy: clerk.id,
        documentType: 'ARREST_WARRANT',
        status: 'ISSUED',
        requestReason: 'Arrest warrant required for absconding accused Mohan Lal',
        issuedFileUrl: 'https://example.com/warrants/case1-arrest-warrant.pdf',
        remarks: 'Issued by court clerk on 2025-01-20',
        createdAt: new Date('2025-01-18'),
      },
      {
        caseId: case1.id,
        requestedBy: police1.id,
        approvedBy: sho1.id,
        documentType: 'SEARCH_WARRANT',
        status: 'SHO_APPROVED',
        requestReason: 'Search warrant for suspect hideout',
        createdAt: new Date('2025-01-25'),
      },
    ],
  });

  // Create Court Actions
  console.log('Creating court actions...');
  await prisma.courtAction.createMany({
    data: [
      {
        caseId: case2.id,
        actionType: 'COGNIZANCE',
        orderFileUrl: 'https://example.com/orders/case2-cognizance.pdf',
        actionDate: new Date('2025-03-28'),
      },
    ],
  });

  // Create Document Checklists
  console.log('Creating document checklists...');
  await prisma.documentChecklist.createMany({
    data: [
      {
        caseId: case1.id,
        requiredDocument: 'FIR Copy',
        isUploaded: true,
      },
      {
        caseId: case1.id,
        requiredDocument: 'Forensic Report',
        isUploaded: true,
      },
      {
        caseId: case1.id,
        requiredDocument: 'Witness Statements',
        isUploaded: true,
      },
      {
        caseId: case1.id,
        requiredDocument: 'Medical Report',
        isUploaded: false,
      },
      {
        caseId: case2.id,
        requiredDocument: 'FIR Copy',
        isUploaded: true,
      },
      {
        caseId: case2.id,
        requiredDocument: 'Seizure Memo',
        isUploaded: true,
      },
    ],
  });

  // Create Case Reopen Request
  console.log('Creating case reopen request...');
  await prisma.caseReopenRequest.create({
    data: {
      caseId: case3.id,
      requestedBy: police1.id,
      reviewedBy: judge.id,
      status: 'APPROVED',
      policeReason: 'New evidence discovered pointing to suspect involvement',
      judgeNote: 'Request approved. Case may be reopened for further investigation.',
      createdAt: new Date('2025-04-15'),
      decidedAt: new Date('2025-04-18'),
    },
  });

  // Create Audit Logs
  console.log('Creating audit logs...');
  await prisma.auditLog.createMany({
    data: [
      {
        userId: police1.id,
        action: 'CREATE',
        entity: 'FIR',
        entityId: fir1.id,
        timestamp: new Date('2025-01-15'),
      },
      {
        userId: sho1.id,
        action: 'UPDATE',
        entity: 'CASE',
        entityId: case1.id,
        timestamp: new Date('2025-01-15'),
      },
      {
        userId: police2.id,
        action: 'CREATE',
        entity: 'EVIDENCE',
        entityId: case2.id,
        timestamp: new Date('2025-02-12'),
      },
    ],
  });

  console.log('Creating additional dashboard coverage cases...');

  type DashboardCaseConfig = {
    firNumber: string;
    stationId: string;
    registeredBy: string;
    sectionsApplied: string;
    incidentDate: string;
    createdAt: string;
    statePath: string[];
    assignedOfficerId?: string;
    accusedNames?: string[];
    evidenceCount?: number;
    witnessCount?: number;
    investigationEventCount?: number;
    includeChargeSheet?: boolean;
    includeClosureReport?: boolean;
    courtId?: string;
    courtSubmissionStatus?: 'SUBMITTED' | 'ACCEPTED';
    courtActions?: Array<{
      actionType: 'COGNIZANCE' | 'HEARING' | 'JUDGMENT' | 'CONVICTION';
      offsetDays: number;
    }>;
    documentRequests?: Array<{
      documentType: 'ARREST_WARRANT' | 'SEARCH_WARRANT' | 'REMAND_ORDER' | 'CHARGE_SHEET_COPY';
      status: 'REQUESTED' | 'SHO_APPROVED' | 'ISSUED';
      requestedBy: string;
      approvedBy?: string;
      issuedBy?: string;
      requestReason: string;
      remarks?: string;
      issuedFileUrl?: string;
      offsetDays: number;
    }>;
    reopenRequest?: {
      requestedBy: string;
      status: 'REQUESTED' | 'APPROVED' | 'REJECTED';
      policeReason: string;
      reviewedBy?: string;
      judgeNote?: string;
      offsetDays: number;
      decidedOffsetDays?: number;
    };
    isArchived?: boolean;
    closureReportUrl?: string;
  };

  const addDays = (date: string, days: number) => {
    const value = new Date(date);
    value.setDate(value.getDate() + days);
    return value;
  };

  const actorForState = (state: string, assignedOfficerId?: string) => {
    switch (state) {
      case 'CASE_ASSIGNED':
        return sho1.id;
      case 'UNDER_INVESTIGATION':
      case 'INVESTIGATION_COMPLETED':
        return assignedOfficerId || police1.id;
      case 'CHARGE_SHEET_PREPARED':
      case 'SUBMITTED_TO_COURT':
        return sho1.id;
      case 'COURT_ACCEPTED':
        return clerk.id;
      case 'TRIAL_ONGOING':
      case 'JUDGMENT_RESERVED':
      case 'DISPOSED':
      case 'ARCHIVED':
        return judge.id;
      default:
        return sho1.id;
    }
  };

  const createDashboardCase = async (config: DashboardCaseConfig) => {
    const fir = await prisma.fir.create({
      data: {
        firNumber: config.firNumber,
        firSource: 'POLICE',
        registeredBy: config.registeredBy,
        policeStationId: config.stationId,
        incidentDate: new Date(config.incidentDate),
        sectionsApplied: config.sectionsApplied,
        firDocumentUrl: `https://example.com/firs/${config.firNumber.replace(/\//g, '-').toLowerCase()}.pdf`,
        createdAt: new Date(config.createdAt),
      },
    });

    const caseRecord = await prisma.case.create({
      data: {
        firId: fir.id,
        createdAt: new Date(config.createdAt),
        isArchived: config.isArchived || false,
        closureReportUrl: config.closureReportUrl,
      },
    });

    await prisma.currentCaseState.create({
      data: {
        caseId: caseRecord.id,
        currentState: config.statePath[config.statePath.length - 1] as any,
        updatedAt: addDays(config.createdAt, config.statePath.length),
      },
    });

    if (config.statePath.length > 1) {
      await prisma.caseStateHistory.createMany({
        data: config.statePath.slice(1).map((toState, index) => ({
          caseId: caseRecord.id,
          fromState: config.statePath[index] as any,
          toState: toState as any,
          changedBy: actorForState(toState, config.assignedOfficerId),
          changeReason: `${toState.replace(/_/g, ' ')} transition`,
          changedAt: addDays(config.createdAt, index + 1),
        })),
      });
    }

    if (config.assignedOfficerId) {
      await prisma.caseAssignment.create({
        data: {
          caseId: caseRecord.id,
          assignedTo: config.assignedOfficerId,
          assignedBy: sho1.id,
          assignmentReason: 'Dashboard seed assignment',
          assignedAt: addDays(config.createdAt, 1),
        },
      });
    }

    const accusedRecords = [] as Array<{ id: string; name: string }>;
    for (const [index, accusedName] of (config.accusedNames || ['Unknown Accused']).entries()) {
      const accused = await prisma.accused.create({
        data: {
          caseId: caseRecord.id,
          name: accusedName,
          status: index === 0 ? 'ARRESTED' : 'ON_BAIL',
        },
      });
      accusedRecords.push({ id: accused.id, name: accused.name });
    }

    for (let index = 0; index < (config.investigationEventCount || 0); index += 1) {
      await prisma.investigationEvent.create({
        data: {
          caseId: caseRecord.id,
          eventType: index % 2 === 0 ? 'SEARCH' : 'STATEMENT',
          description: `Supplemental investigation event ${index + 1} for ${config.firNumber}`,
          performedBy: config.assignedOfficerId || config.registeredBy,
          eventDate: addDays(config.createdAt, index + 2),
        },
      });
    }

    for (let index = 0; index < (config.evidenceCount || 0); index += 1) {
      await prisma.evidence.create({
        data: {
          caseId: caseRecord.id,
          category: index % 2 === 0 ? 'PHOTO' : 'REPORT',
          fileUrl: `https://example.com/evidence/${config.firNumber.replace(/\//g, '-').toLowerCase()}-${index + 1}.pdf`,
          fileName: `${config.firNumber.replace(/\//g, '-')}-evidence-${index + 1}.pdf`,
          mimeType: 'application/pdf',
          uploadedBy: config.assignedOfficerId || config.registeredBy,
          uploadedAt: addDays(config.createdAt, index + 2),
        },
      });
    }

    for (let index = 0; index < (config.witnessCount || 0); index += 1) {
      await prisma.witness.create({
        data: {
          caseId: caseRecord.id,
          name: `Witness ${index + 1} - ${config.firNumber}`,
          contact: `9000000${(index + 1).toString().padStart(3, '0')}`,
          address: `${index + 1}, Justice Road, Bengaluru`,
          statementFileUrl: `https://example.com/witness/${config.firNumber.replace(/\//g, '-').toLowerCase()}-${index + 1}.pdf`,
        },
      });
    }

    if (config.includeChargeSheet) {
      await prisma.document.create({
        data: {
          caseId: caseRecord.id,
          documentType: 'CHARGE_SHEET',
          version: 1,
          status: 'FINAL',
          contentJson: {
            title: `Charge Sheet - ${config.firNumber}`,
            sections: config.sectionsApplied,
            summary: `Charge sheet prepared for ${config.firNumber}`,
          },
          createdBy: sho1.id,
          createdAt: addDays(config.createdAt, 4),
        },
      });
    }

    if (config.includeClosureReport) {
      await prisma.document.create({
        data: {
          caseId: caseRecord.id,
          documentType: 'CLOSURE_REPORT',
          version: 1,
          status: 'FINAL',
          contentJson: {
            title: `Closure Report - ${config.firNumber}`,
            recommendation: 'Archived after disposal for dashboard coverage',
          },
          createdBy: judge.id,
          createdAt: addDays(config.createdAt, 7),
        },
      });
    }

    if (config.courtId) {
      const submission = await prisma.courtSubmission.create({
        data: {
          caseId: caseRecord.id,
          submissionVersion: 1,
          submittedBy: sho1.id,
          courtId: config.courtId,
          submittedAt: addDays(config.createdAt, 5),
          status: config.courtSubmissionStatus || 'SUBMITTED',
        },
      });

      await prisma.acknowledgement.create({
        data: {
          submissionId: submission.id,
          ackNumber: `ACK-${config.firNumber.replace(/\//g, '-')}`,
          ackTime: addDays(config.createdAt, 5),
        },
      });
    }

    if (config.courtActions?.length) {
      await prisma.courtAction.createMany({
        data: config.courtActions.map((action, index) => ({
          caseId: caseRecord.id,
          actionType: action.actionType,
          orderFileUrl: `https://example.com/orders/${config.firNumber.replace(/\//g, '-').toLowerCase()}-${index + 1}.pdf`,
          actionDate: addDays(config.createdAt, action.offsetDays),
        })),
      });
    }

    if (config.documentRequests?.length) {
      await prisma.documentRequest.createMany({
        data: config.documentRequests.map((request) => ({
          caseId: caseRecord.id,
          requestedBy: request.requestedBy,
          approvedBy: request.approvedBy,
          issuedBy: request.issuedBy,
          documentType: request.documentType,
          status: request.status,
          requestReason: request.requestReason,
          remarks: request.remarks,
          issuedFileUrl: request.issuedFileUrl,
          createdAt: addDays(config.createdAt, request.offsetDays),
        })),
      });
    }

    if (config.reopenRequest) {
      await prisma.caseReopenRequest.create({
        data: {
          caseId: caseRecord.id,
          requestedBy: config.reopenRequest.requestedBy,
          reviewedBy: config.reopenRequest.reviewedBy,
          status: config.reopenRequest.status,
          policeReason: config.reopenRequest.policeReason,
          judgeNote: config.reopenRequest.judgeNote,
          createdAt: addDays(config.createdAt, config.reopenRequest.offsetDays),
          decidedAt: config.reopenRequest.decidedOffsetDays !== undefined
            ? addDays(config.createdAt, config.reopenRequest.decidedOffsetDays)
            : null,
        },
      });
    }

    await prisma.auditLog.createMany({
      data: [
        {
          userId: config.registeredBy,
          action: 'CREATE',
          entity: 'CASE',
          entityId: caseRecord.id,
          timestamp: new Date(config.createdAt),
        },
        {
          userId: actorForState(config.statePath[config.statePath.length - 1], config.assignedOfficerId),
          action: 'STATE_UPDATED',
          entity: 'CASE',
          entityId: caseRecord.id,
          timestamp: addDays(config.createdAt, config.statePath.length),
        },
      ],
    });

    return { fir, caseRecord, accusedRecords };
  };

  const dashboardCases: DashboardCaseConfig[] = [
    {
      firNumber: 'FIR/2025/0004',
      stationId: station1.id,
      registeredBy: police1.id,
      sectionsApplied: 'IPC 457, 380',
      incidentDate: '2025-04-02',
      createdAt: '2025-04-02',
      statePath: ['FIR_REGISTERED'],
      accusedNames: ['Mahesh Rao'],
    },
    {
      firNumber: 'FIR/2025/0005',
      stationId: station1.id,
      registeredBy: police2.id,
      sectionsApplied: 'IPC 354, 506',
      incidentDate: '2025-04-04',
      createdAt: '2025-04-04',
      statePath: ['FIR_REGISTERED'],
      accusedNames: ['Deepak Jain'],
    },
    {
      firNumber: 'FIR/2025/0006',
      stationId: station1.id,
      registeredBy: police1.id,
      sectionsApplied: 'IPC 307, 34',
      incidentDate: '2025-04-06',
      createdAt: '2025-04-06',
      statePath: ['FIR_REGISTERED', 'CASE_ASSIGNED', 'UNDER_INVESTIGATION'],
      assignedOfficerId: police1.id,
      accusedNames: ['Shankar Naik'],
      evidenceCount: 2,
      witnessCount: 1,
      investigationEventCount: 2,
    },
    {
      firNumber: 'FIR/2025/0007',
      stationId: station1.id,
      registeredBy: police1.id,
      sectionsApplied: 'IPC 420, 468',
      incidentDate: '2025-04-08',
      createdAt: '2025-04-08',
      statePath: ['FIR_REGISTERED', 'CASE_ASSIGNED', 'UNDER_INVESTIGATION', 'INVESTIGATION_COMPLETED'],
      assignedOfficerId: police1.id,
      accusedNames: ['Kiran Shetty'],
      evidenceCount: 1,
      witnessCount: 1,
      investigationEventCount: 2,
    },
    {
      firNumber: 'FIR/2025/0008',
      stationId: station1.id,
      registeredBy: police2.id,
      sectionsApplied: 'IPC 379, 411',
      incidentDate: '2025-04-10',
      createdAt: '2025-04-10',
      statePath: ['FIR_REGISTERED', 'CASE_ASSIGNED', 'UNDER_INVESTIGATION', 'INVESTIGATION_COMPLETED', 'CHARGE_SHEET_PREPARED'],
      assignedOfficerId: police2.id,
      accusedNames: ['Arun Mistry'],
      evidenceCount: 1,
      witnessCount: 1,
      investigationEventCount: 1,
      includeChargeSheet: true,
      documentRequests: [
        {
          documentType: 'REMAND_ORDER',
          status: 'REQUESTED',
          requestedBy: police2.id,
          requestReason: 'Remand extension required before court filing',
          offsetDays: 4,
        },
      ],
    },
    {
      firNumber: 'FIR/2025/0009',
      stationId: station1.id,
      registeredBy: police2.id,
      sectionsApplied: 'IPC 498A, 406',
      incidentDate: '2025-04-12',
      createdAt: '2025-04-12',
      statePath: ['FIR_REGISTERED', 'CASE_ASSIGNED', 'UNDER_INVESTIGATION', 'INVESTIGATION_COMPLETED', 'CHARGE_SHEET_PREPARED', 'SUBMITTED_TO_COURT'],
      assignedOfficerId: police2.id,
      accusedNames: ['Nitin Verma'],
      evidenceCount: 1,
      witnessCount: 1,
      investigationEventCount: 1,
      includeChargeSheet: true,
      courtId: court1.id,
      courtSubmissionStatus: 'SUBMITTED',
      documentRequests: [
        {
          documentType: 'CHARGE_SHEET_COPY',
          status: 'SHO_APPROVED',
          requestedBy: police2.id,
          approvedBy: sho1.id,
          requestReason: 'Certified charge sheet copy needed for court bundle',
          offsetDays: 5,
        },
      ],
    },
    {
      firNumber: 'FIR/2025/0010',
      stationId: station1.id,
      registeredBy: police1.id,
      sectionsApplied: 'IPC 324, 326',
      incidentDate: '2025-04-14',
      createdAt: '2025-04-14',
      statePath: ['FIR_REGISTERED', 'CASE_ASSIGNED', 'UNDER_INVESTIGATION', 'INVESTIGATION_COMPLETED', 'CHARGE_SHEET_PREPARED', 'SUBMITTED_TO_COURT'],
      assignedOfficerId: police1.id,
      accusedNames: ['Rohit Das'],
      evidenceCount: 1,
      witnessCount: 1,
      investigationEventCount: 1,
      includeChargeSheet: true,
      courtId: court1.id,
      courtSubmissionStatus: 'SUBMITTED',
    },
    {
      firNumber: 'FIR/2025/0011',
      stationId: station1.id,
      registeredBy: police1.id,
      sectionsApplied: 'IPC 395, 397',
      incidentDate: '2025-04-16',
      createdAt: '2025-04-16',
      statePath: ['FIR_REGISTERED', 'CASE_ASSIGNED', 'UNDER_INVESTIGATION', 'INVESTIGATION_COMPLETED', 'CHARGE_SHEET_PREPARED', 'SUBMITTED_TO_COURT', 'COURT_ACCEPTED'],
      assignedOfficerId: police1.id,
      accusedNames: ['Imran Khan'],
      evidenceCount: 1,
      witnessCount: 1,
      investigationEventCount: 2,
      includeChargeSheet: true,
      courtId: court1.id,
      courtSubmissionStatus: 'ACCEPTED',
      courtActions: [
        { actionType: 'COGNIZANCE', offsetDays: 7 },
      ],
    },
    {
      firNumber: 'FIR/2025/0012',
      stationId: station1.id,
      registeredBy: police2.id,
      sectionsApplied: 'IPC 376, 506',
      incidentDate: '2025-04-18',
      createdAt: '2025-04-18',
      statePath: ['FIR_REGISTERED', 'CASE_ASSIGNED', 'UNDER_INVESTIGATION', 'INVESTIGATION_COMPLETED', 'CHARGE_SHEET_PREPARED', 'SUBMITTED_TO_COURT', 'COURT_ACCEPTED', 'TRIAL_ONGOING'],
      assignedOfficerId: police2.id,
      accusedNames: ['Vikram Singh'],
      evidenceCount: 1,
      witnessCount: 1,
      investigationEventCount: 2,
      includeChargeSheet: true,
      courtId: court1.id,
      courtSubmissionStatus: 'ACCEPTED',
      courtActions: [
        { actionType: 'COGNIZANCE', offsetDays: 7 },
        { actionType: 'HEARING', offsetDays: 9 },
      ],
    },
    {
      firNumber: 'FIR/2025/0013',
      stationId: station1.id,
      registeredBy: police1.id,
      sectionsApplied: 'IPC 409, 120B',
      incidentDate: '2025-04-20',
      createdAt: '2025-04-20',
      statePath: ['FIR_REGISTERED', 'CASE_ASSIGNED', 'UNDER_INVESTIGATION', 'INVESTIGATION_COMPLETED', 'CHARGE_SHEET_PREPARED', 'SUBMITTED_TO_COURT', 'COURT_ACCEPTED', 'TRIAL_ONGOING', 'JUDGMENT_RESERVED'],
      assignedOfficerId: police1.id,
      accusedNames: ['Sanjay Kulkarni'],
      evidenceCount: 1,
      witnessCount: 1,
      investigationEventCount: 2,
      includeChargeSheet: true,
      courtId: court1.id,
      courtSubmissionStatus: 'ACCEPTED',
      courtActions: [
        { actionType: 'COGNIZANCE', offsetDays: 7 },
        { actionType: 'HEARING', offsetDays: 10 },
      ],
    },
    {
      firNumber: 'FIR/2025/0014',
      stationId: station1.id,
      registeredBy: police2.id,
      sectionsApplied: 'IPC 304B, 498A',
      incidentDate: '2025-04-22',
      createdAt: '2025-04-22',
      statePath: ['FIR_REGISTERED', 'CASE_ASSIGNED', 'UNDER_INVESTIGATION', 'INVESTIGATION_COMPLETED', 'CHARGE_SHEET_PREPARED', 'SUBMITTED_TO_COURT', 'COURT_ACCEPTED', 'TRIAL_ONGOING', 'DISPOSED'],
      assignedOfficerId: police2.id,
      accusedNames: ['Manoj Tyagi'],
      evidenceCount: 1,
      witnessCount: 1,
      investigationEventCount: 2,
      includeChargeSheet: true,
      courtId: court1.id,
      courtSubmissionStatus: 'ACCEPTED',
      courtActions: [
        { actionType: 'COGNIZANCE', offsetDays: 7 },
        { actionType: 'HEARING', offsetDays: 9 },
        { actionType: 'CONVICTION', offsetDays: 12 },
      ],
    },
    {
      firNumber: 'FIR/2025/0015',
      stationId: station1.id,
      registeredBy: police1.id,
      sectionsApplied: 'IPC 201, 202',
      incidentDate: '2025-04-24',
      createdAt: '2025-04-24',
      statePath: ['FIR_REGISTERED', 'CASE_ASSIGNED', 'UNDER_INVESTIGATION', 'INVESTIGATION_COMPLETED', 'CHARGE_SHEET_PREPARED', 'SUBMITTED_TO_COURT', 'COURT_ACCEPTED', 'TRIAL_ONGOING', 'ARCHIVED'],
      assignedOfficerId: police1.id,
      accusedNames: ['Pankaj Nair'],
      evidenceCount: 1,
      witnessCount: 1,
      investigationEventCount: 1,
      includeClosureReport: true,
      courtId: court1.id,
      courtSubmissionStatus: 'ACCEPTED',
      courtActions: [
        { actionType: 'COGNIZANCE', offsetDays: 7 },
        { actionType: 'HEARING', offsetDays: 9 },
        { actionType: 'JUDGMENT', offsetDays: 12 },
      ],
      isArchived: true,
      closureReportUrl: 'https://example.com/closure/fir-2025-0015.pdf',
      reopenRequest: {
        requestedBy: police1.id,
        status: 'REQUESTED',
        policeReason: 'Fresh witness statement and CCTV footage recovered',
        offsetDays: 13,
      },
    },
  ];

  for (const config of dashboardCases) {
    await createDashboardCase(config);
  }

  console.log('✅ Database seeded successfully with comprehensive dummy data!');
  console.log('\n📋 Test Credentials:');
  console.log('-------------------');
  console.log('SHO (Central):');
  console.log('  Email: sho.central@police.gov');
  console.log('  Password: password123');
  console.log('\nPolice Officer 1:');
  console.log('  Email: officer1@police.gov');
  console.log('  Password: password123');
  console.log('\nPolice Officer 2:');
  console.log('  Email: officer2@police.gov');
  console.log('  Password: password123');
  console.log('\nSHO (North):');
  console.log('  Email: sho.north@police.gov');
  console.log('  Password: password123');
  console.log('\nCourt Clerk:');
  console.log('  Email: clerk@court.gov');
  console.log('  Password: password123');
  console.log('\nJudge:');
  console.log('  Email: judge@court.gov');
  console.log('  Password: password123');
  console.log('\n🏢 Organizations:');
  console.log('-------------------');
  console.log(`Police Station 1: ${station1.name}`);
  console.log(`Police Station 2: ${station2.name}`);
  console.log(`Court 1: ${court1.name}`);
  console.log(`Court 2: ${court2.name}`);
  console.log('\n📊 Sample Data Created:');
  console.log('-------------------');
  console.log('✓ Dashboard-ready cases across FIR, investigation, court intake, trial, and archive stages');
  console.log('✓ Mixed police, SHO, clerk, and judge workflow data');
  console.log('✓ Pending and approved document requests for court flow testing');
  console.log('✓ Pending and decided case reopen requests for judge workflow testing');
  console.log('\n🎯 Case States:');
  console.log('-------------------');
  console.log(`Case 1 (${fir1.firNumber}): UNDER_INVESTIGATION`);
  console.log(`Case 2 (${fir2.firNumber}): CHARGE_SHEET_PREPARED`);
  console.log(`Case 3 (${fir3.firNumber}): CLOSURE_REPORT_PREPARED (with reopen request)`);
  console.log('Additional seeded states: FIR_REGISTERED, INVESTIGATION_COMPLETED, SUBMITTED_TO_COURT, COURT_ACCEPTED, TRIAL_ONGOING, JUDGMENT_RESERVED, DISPOSED, ARCHIVED');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
