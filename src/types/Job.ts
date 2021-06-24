export enum EStatus {
  process = "process",
  completed = "completed",
  error = "error",
  pending = "pending"
}

export interface IJobStats {
  percent: number;
  message?: string;
  type: keyof typeof EStatus
}
