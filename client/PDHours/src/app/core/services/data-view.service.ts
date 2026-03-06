import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import {
  CreateEmployeeRequestDto,
  EmployeeLatestReportDto,
  CreateReportRequestDto,
  CreateSquadRequestDto,
  EmployeeListDto,
  EmployeeTableView,
  SquadDailyAverageDto,
  SquadListDto,
  SquadMemberDetailsDto,
  SquadMemberTableView,
  SquadTableView,
  SquadTotalHoursDto
} from '../models/data-view.models';

@Injectable({ providedIn: 'root' })
export class DataViewService {
  private readonly http = inject(HttpClient);

  private readonly apiBaseUrl = 'https://localhost:7185';

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

  getSquadTableView(): Observable<SquadTableView[]> {
    return forkJoin({
      squads: this.getSquadsDto(),
      employees: this.getEmployeesDto().pipe(catchError(() => of([] as EmployeeListDto[])))
    }).pipe(
      map(({ squads, employees }) => {
        return squads.map((squad) => {
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
        });
      })
    );
  }

  getSquadsList(): Observable<SquadListDto[]> {
    return this.getSquadsDto();
  }

  createSquad(request: CreateSquadRequestDto): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}/Squad`, request);
  }

  createEmployee(request: CreateEmployeeRequestDto): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}/Employee`, request);
  }

  createReport(request: CreateReportRequestDto): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}/Report`, request);
  }

  getSquadMemberDetails(
    id: number,
    startDate: string,
    endDate: string
  ): Observable<SquadMemberDetailsDto[]> {
    return this.http.get<SquadMemberDetailsDto[]>(
      `${this.apiBaseUrl}/Squad/MemberDetails?id=${id}&startDate=${startDate}&endDate=${endDate}`
    );
  }

  getSquadTotalHours(id: number): Observable<SquadTotalHoursDto> {
    return this.http.get<SquadTotalHoursDto>(`${this.apiBaseUrl}/Squad/MemberReportsTotalHours?id=${id}`);
  }

  getSquadDailyAverage(id: number, startDate: string, endDate: string): Observable<SquadDailyAverageDto> {
    return this.http.get<SquadDailyAverageDto>(
      `${this.apiBaseUrl}/Squad/DailyAverage?id=${id}&startDate=${startDate}&endDate=${endDate}`
    );
  }

  getSquadMemberTableView(
    id: number,
    startDate: string,
    endDate: string
  ): Observable<SquadMemberTableView[]> {
    return this.getSquadMemberDetails(id, startDate, endDate).pipe(
      switchMap((members) => {
        if (members.length === 0) {
          return of([] as SquadMemberTableView[]);
        }

        return forkJoin(
          members.map((member) =>
            this.getEmployeeLatestReport(member.employeeId, startDate, endDate).pipe(
              map((latestReport) => ({
                employeeId: member.employeeId,
                name: member.name,
                totalHours: member.totalHours,
                lastDescription: latestReport?.description ?? '-',
                lastCreatedAt: latestReport?.createdAt ?? '-'
              }))
            )
          )
        );
      })
    );
  }

  getEmployeeLatestReport(
    employeeId: number,
    _startDate: string,
    _endDate: string
  ): Observable<EmployeeLatestReportDto | null> {
    const filterExpr = `EmployeeId eq ${employeeId}`;
    const url =
      `${this.apiBaseUrl}/Report` +
      `?$filter=${encodeURIComponent(filterExpr)}` +
      `&$orderby=${encodeURIComponent('Created_At desc')}`;

    return this.http.get<unknown>(url).pipe(
      map((response) => this.extractLatestReport(response)),
      catchError(() => of(null))
    );
  }

  private extractLatestReport(response: unknown): EmployeeLatestReportDto | null {
    const rawRows = this.extractRows(response);
    if (rawRows.length === 0) {
      return null;
    }

    const latest = [...rawRows].sort((a, b) => {
      const aDate = this.readStringProp(a, [
        'Created_At',
        'created_At',
        'created_at',
        'createdAt',
        'CreatedAt',
        'createdIn',
        'CreatedIn',
        'createdOn',
        'CreatedOn',
        'date',
        'Date'
      ]);
      const bDate = this.readStringProp(b, [
        'Created_At',
        'created_At',
        'created_at',
        'createdAt',
        'CreatedAt',
        'createdIn',
        'CreatedIn',
        'createdOn',
        'CreatedOn',
        'date',
        'Date'
      ]);

      const aTime = aDate ? new Date(aDate).getTime() : 0;
      const bTime = bDate ? new Date(bDate).getTime() : 0;
      return bTime - aTime;
    })[0];
    const description = this.readStringProp(latest, ['description', 'Description', 'descricao']);
    const createdAt = this.readStringProp(latest, [
      'Created_At',
      'created_At',
      'created_at',
      'createdAt',
      'CreatedAt',
      'createdIn',
      'CreatedIn',
      'createdOn',
      'CreatedOn',
      'date',
      'Date'
    ]);

    if (!createdAt) {
      return null;
    }

    return {
      description: description || '-',
      createdAt
    };
  }

  private extractRows(response: unknown): Record<string, unknown>[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
    }

    if (!response || typeof response !== 'object') {
      return [];
    }

    const obj = response as Record<string, unknown>;
    const possibleArrays = ['value', 'items', 'data'];
    for (const key of possibleArrays) {
      const maybeArray = obj[key];
      if (Array.isArray(maybeArray)) {
        return maybeArray.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
      }
    }

    return [obj];
  }

  private readStringProp(source: Record<string, unknown>, keys: string[]): string {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }

    return '';
  }

  private getEmployeesDto(): Observable<EmployeeListDto[]> {
    return this.http.get<EmployeeListDto[]>(`${this.apiBaseUrl}/EmployeeDataView`);
  }

  private getSquadsDto(): Observable<SquadListDto[]> {
    return this.http.get<SquadListDto[]>(`${this.apiBaseUrl}/Squad/DataView`);
  }
}
