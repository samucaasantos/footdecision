export type UserRole = "ROLE_DIRECTOR" | "ROLE_ANALYST";

export type Position = "GK" | "DF" | "MF" | "FW";

export type InjuryRisk = "Baixo" | "Moderado" | "Alto";

export interface LoginRequestDTO {
  username: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  type: string;
  expiresIn: number;
  role: UserRole;
  username: string;
}

export interface UserRegisterDTO {
  username: string;
  password: string;
  fullname: string;
  role: UserRole;
}

export interface UserResponseDTO {
  id: number;
  username: string;
  fullname: string;
  role: UserRole;
}

export interface DashboardOverviewDTO {
  totalPayroll: number;
  transferBudgetCap: number;
  totalSquadCount: number;
  priorityTacticalNeed: Position;
  distributionByPosition: Record<Position, number>;
}

export interface ClubConfigUpdateDTO {
  transferBudgetCap: number;
  priorityTacticalNeed: Position;
}

export interface SquadPlayerResponseDTO {
  id: number;
  name: string;
  position: Position;
  age: number;
  salary: number;
  injuryRisk: InjuryRisk;
}

export interface SquadPlayerRequestDTO {
  name: string;
  position: Position;
  age: number;
  salary: number;
  injuryRisk: InjuryRisk;
}

export type ClusterId = 1 | 2 | 3 | 4 | 5 | 6;

export interface SimulationRequestDTO {
  targetPosition: Position;
  targetClusterId: ClusterId;
  maxTransferBudget: number;
  maxMonthlySalary: number;
  maxTolerableRisk: 1.0 | 2.0 | 3.0;
  weightTactical: number;
  weightEconomic: number;
  weightRisk: number;
}

export interface DeterministicReportDTO {
  tacticalDiagnosis: string;
  economicCostBenefit: string;
  payrollImpact: string;
  medicalReliability: string;
}

export interface PlayerRecommendationDTO {
  playerId: number;
  name: string;
  currentClub: string;
  marketValue: number;
  salary: number;
  injuryRisk: InjuryRisk;
  finalScore: number;
  tacticalSimilarity: number;
  economicOpportunity: number;
  technicalReport: DeterministicReportDTO;
}

export interface SimulationResponseDTO {
  recommendations: PlayerRecommendationDTO[];
  totalEvaluated: number;
  totalApprovedFilters: number;
}

export interface RadarAxisDTO {
  metricName: string;
  playerValue: number;
  clusterAverageValue: number;
}

export interface PlayerReportDTO {
  id: number;
  name: string;
  position: Position;
  age: number;
  currentClub: string;
  marketValue: number;
  salary: number;
  injuryRisk: InjuryRisk;
  radarMetrics: RadarAxisDTO[];
}

export interface StandardError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
