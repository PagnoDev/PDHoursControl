export interface EmployeeListDto {
  name: string;
  estimateHours: number;
  squadId: number;
}

export interface SquadListDto {
  id: number;
  name: string;
}

export interface EmployeeTableView {
  name: string;
  estimateHours: number;
  squadId: number;
  squadName: string;
}

export interface SquadTableView {
  id: number;
  name: string;
  employeesCount: number;
  totalEstimateHours: number;
}

export interface CreateSquadRequestDto {
  name: string;
}

export interface CreateEmployeeRequestDto {
  name: string;
  estimateHours: number;
  squadId: number;
}

export interface SquadMemberDetailsDto {
  employeeId: number;
  name: string;
  totalHours: number;
}

export interface EmployeeLatestReportDto {
  description: string;
  createdAt: string;
}

export interface SquadMemberTableView {
  employeeId: number;
  name: string;
  totalHours: number;
  lastDescription: string;
  lastCreatedAt: string;
}

export interface SquadTotalHoursDto {
  squadId: number;
  totalHours: number;
}

export interface SquadDailyAverageDto {
  squadId: number;
  name: string;
  averageHoursPerDay: number;
}

export interface CreateReportRequestDto {
  description: string;
  employeeId: number;
  spentHours: number;
}
