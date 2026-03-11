import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import {
  EmployeeLatestReportDto,
  SquadDailyAverageDto,
  SquadMemberDetailsDto,
  SquadMemberTableView,
  SquadTotalHoursDto
} from '../models/data-view.models';

@Injectable({ providedIn: 'root' })
export class SquadDetailsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:5022';
  private readonly odataCollectionKeys = ['value', 'items', 'data'] as const;

  getSquadMemberDetails(
    id: number,
    startDate: string,
    endDate: string
  ): Observable<SquadMemberDetailsDto[]> {
    return this.http.get<SquadMemberDetailsDto[]>(
      `${this.apiBaseUrl}/Squad/MemberDetails?id=${id}&startDate=${startDate}&endDate=${endDate}`
    );
  }

  getSquadTotalHours(id: number, startDate: string, endDate: string): Observable<SquadTotalHoursDto> {
    return this.http.get<SquadTotalHoursDto>(
      `${this.apiBaseUrl}/Squad/MemberReportsTotalHours?id=${id}&startDate=${startDate}&endDate=${endDate}`
    );
  }

  getSquadDailyAverage(
    id: number,
    startDate: string,
    endDate: string
  ): Observable<SquadDailyAverageDto> {
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

  private getEmployeeLatestReport(
    employeeId: number,
    startDate: string,
    endDate: string
  ): Observable<EmployeeLatestReportDto | null> {
    const filterExpr = `EmployeeId eq ${employeeId}`;
    const url =
      `${this.apiBaseUrl}/Report` +
      `?$filter=${encodeURIComponent(filterExpr)}` +
      `&$orderby=${encodeURIComponent('created_At desc')}`;

    return this.http.get<Record<string, unknown> | ReportRow[]>(url).pipe(
      map((response) => this.extractLatestReport(response, startDate, endDate)),
      catchError(() => of(null))
    );
  }

  private extractLatestReport(
    response: Record<string, unknown> | ReportRow[],
    startDate: string,
    endDate: string
  ): EmployeeLatestReportDto | null {
    const startRangeTime = new Date(`${startDate}T00:00:00`).getTime();
    const endRangeTime = new Date(`${endDate}T23:59:59`).getTime();
    const rows = this.extractRows(response).filter((row) => {
      const reportTime = new Date(row.created_At).getTime();
      if (Number.isNaN(reportTime)) {
        return false;
      }

      return reportTime >= startRangeTime && reportTime <= endRangeTime;
    });

    if (rows.length === 0) {
      return null;
    }

    const latest = [...rows].sort((first, second) => {
      const firstTime = new Date(first.created_At).getTime();
      const secondTime = new Date(second.created_At).getTime();
      return secondTime - firstTime;
    })[0];

    return {
      description: latest.description || '-',
      createdAt: latest.created_At
    };
  }

  /**
   * Caso o filtro do OData seja alterado, a estrutura da resposta possa variar, então esse método tenta extrair os dados de forma resiliente.
   * Ele procura por arrays diretamente na resposta ou dentro de propriedades comuns como 'value', 'items' ou 'data'. Se não encontrar, tenta tratar a resposta como um único objeto.
   * Além disso, ele garante que os itens extraídos sejam objetos válidos, filtrando valores nulos ou de tipos inesperados.
   * Caso alguém altere o filtro do OData e a resposta deixe de conter os dados esperados, o método ainda tentará extrair o máximo de informações possível, retornando um array vazio ou um objeto único conforme o caso, ao invés de lançar erros.
   */
  private extractRows(response: Record<string, unknown> | ReportRow[]): ReportRow[] {
    if (Array.isArray(response)) {
      return response as ReportRow[];
    }

    for (const key of this.odataCollectionKeys) {
      const responseObject = response as Partial<Record<(typeof this.odataCollectionKeys)[number], unknown>>;
      const possibleArray = responseObject[key];
      if (Array.isArray(possibleArray)) {
        return possibleArray as ReportRow[];
      }
    }

    return [response as unknown as ReportRow];
  }
}

interface ReportRow {
  created_At: string;
  description: string;
}
