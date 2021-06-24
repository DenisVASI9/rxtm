import {Job} from "../classes/Job";

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

export type Jobs = Job[]
export type AnyFunction = (...args: any[]) => any
export type AnyFunctions = AnyFunction[]
