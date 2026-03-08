import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import {
  CreateEmployeeRequestDto,
  EmployeeListDto,
  EmployeeTableView,
  SquadListDto
} from '../models/data-view.models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:5022';

  getEmployeeTableView(): Observable<EmployeeTableView[]> {
    return forkJoin({
      employees: this.getEmployeesDto(),
      squads: this.getSquadsDto()
    }).pipe(
      map(({ employees, squads }) => {
        const squadsById = new Map<number, string>();
        for (const squad of squads) {
          squadsById.set(squad.id, squad.name);
        }

        return employees.map((employee) => ({
          name: employee.name,
          estimateHours: employee.estimateHours,
          squadId: employee.squadId,
          squadName: squadsById.get(employee.squadId) ?? `Squad ${employee.squadId}`
        }));
      })
    );
  }

  createEmployee(request: CreateEmployeeRequestDto): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}/Employee`, request);
  }

  private getEmployeesDto(): Observable<EmployeeListDto[]> {
    return this.http.get<EmployeeListDto[]>(`${this.apiBaseUrl}/EmployeeDataView`);
  }

  private getSquadsDto(): Observable<SquadListDto[]> {
    return this.http.get<SquadListDto[]>(`${this.apiBaseUrl}/Squad/DataView`);
  }
}
