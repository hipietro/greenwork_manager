export type DashboardJob = {
  id: number;
  title: string;
  customerName: string | null;
  address: string | null;
  scheduledDate: string;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  operationalNotes: string | null;
  finalNotes: string | null;
  workType: {
    id: number;
    name: string;
  } | null;
  jobStatus: {
    id: number;
    name: string;
  } | null;
  equipment: {
    id: number;
    equipment: {
      id: number;
      name: string;
    };
  }[];
};

export type DailyDashboard = {
  date: string;
  totalJobs: number;
  statusSummary: Record<string, number>;
  jobsWithoutEquipment: number;
  jobs: DashboardJob[];
};