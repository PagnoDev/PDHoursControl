import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import {
  CreateSquadRequestDto,
  EmployeeListDto,
  SquadListDto,
  SquadTableView
} from '../models/data-view.models';

@Injectable({ providedIn: 'root' })
export class SquadService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:5022';

  getSquadTableView(): Observable<SquadTableView[]> {
    return forkJoin({
      squads: this.getSquadsDto(),
      employees: this.getEmployeesDto().pipe(catchError(() => of([] as EmployeeListDto[])))
    }).pipe(
      map(({ squads, employees }) =>
        squads.map((squad) => {
          const employeesBySquad = employees.filter((employee) => employee.squadId === squad.id);
          const totalEstimateHours = employeesBySquad.reduce(
            (total, employee) => total + employee.estimateHours,
            0
          );

          return {
            id: squad.id,
            name: squad.name,
            employeesCount: employeesBySquad.length,
            totalEstimateHours
          };
        })
      )
    );
  }

  getSquadsList(): Observable<SquadListDto[]> {
    return this.getSquadsDto();
  }

  createSquad(request: CreateSquadRequestDto): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}/Squad`, request);
  }

  private getEmployeesDto(): Observable<EmployeeListDto[]> {
    return this.http.get<EmployeeListDto[]>(`${this.apiBaseUrl}/EmployeeDataView`);
  }

  private getSquadsDto(): Observable<SquadListDto[]> {
    return this.http.get<SquadListDto[]>(`${this.apiBaseUrl}/Squad/DataView`);
  }
}
