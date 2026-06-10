export type Job = {
  id: number;
  title: string;
  customerName: string | null;
  address: string | null;
  scheduledDate: string;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  operationalNotes: string | null;
  finalNotes: string | null;
  workTypeId: number | null;
  jobStatusId: number | null;
  createdAt: string;
  updatedAt: string;
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
    equipmentId: number;
    equipment: {
      id: number;
      name: string;
    };
  }[];
};