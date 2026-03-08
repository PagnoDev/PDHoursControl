import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateReportRequestDto } from '../models/data-view.models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:5022';

  createReport(request: CreateReportRequestDto): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}/Report`, request);
  }
}
