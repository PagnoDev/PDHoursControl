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
      `&$orderby=${encodeURIComponent('Created_At desc')}`;

    return this.http.get<unknown>(url).pipe(
      map((response) => this.extractLatestReport(response, startDate, endDate)),
      catchError(() => of(null))
    );
  }

  private extractLatestReport(
    response: unknown,
    startDate: string,
    endDate: string
  ): EmployeeLatestReportDto | null {
    const startRangeTime = new Date(`${startDate}T00:00:00`).getTime();
    const endRangeTime = new Date(`${endDate}T23:59:59`).getTime();
    const rows = this.extractRows(response).filter((row) => {
      const dateValue = row['Created_At'];
      if (typeof dateValue !== 'string' || dateValue.trim().length === 0) {
        return false;
      }

      const reportTime = new Date(dateValue).getTime();
      if (Number.isNaN(reportTime)) {
        return false;
      }

      return reportTime >= startRangeTime && reportTime <= endRangeTime;
    });

    if (rows.length === 0) {
      return null;
    }

    const latest = [...rows].sort((first, second) => {
      const firstDate = typeof first['Created_At'] === 'string' ? first['Created_At'] : '';
      const secondDate = typeof second['Created_At'] === 'string' ? second['Created_At'] : '';
      const firstTime = firstDate ? new Date(firstDate).getTime() : 0;
      const secondTime = secondDate ? new Date(secondDate).getTime() : 0;
      return secondTime - firstTime;
    })[0];

    const description = typeof latest['Description'] === 'string' ? latest['Description'] : '';
    const createdAt = typeof latest['Created_At'] === 'string' ? latest['Created_At'] : '';
    if (!createdAt) {
      return null;
    }

    return {
      description: description || '-',
      createdAt
    };
  }

  /**
   * Caso o filtro do OData seja alterado, a estrutura da resposta possa variar, então esse método tenta extrair os dados de forma resiliente.
   * Ele procura por arrays diretamente na resposta ou dentro de propriedades comuns como 'value', 'items' ou 'data'. Se não encontrar, tenta tratar a resposta como um único objeto.
   * Além disso, ele garante que os itens extraídos sejam objetos válidos, filtrando valores nulos ou de tipos inesperados.
   * Caso alguém altere o filtro do OData e a resposta deixe de conter os dados esperados, o método ainda tentará extrair o máximo de informações possível, retornando um array vazio ou um objeto único conforme o caso, ao invés de lançar erros.
   */
  private extractRows(response: unknown): Record<string, unknown>[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
    }

    if (!response || typeof response !== 'object') {
      return [];
    }

    const responseObject = response as Record<string, unknown>;
    for (const key of ['value', 'items', 'data']) {
      const possibleArray = responseObject[key];
      if (Array.isArray(possibleArray)) {
        return possibleArray.filter(
          (item): item is Record<string, unknown> => !!item && typeof item === 'object'
        );
      }
    }

    return [responseObject];
  }
}
