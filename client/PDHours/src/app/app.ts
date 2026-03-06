import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { DataViewService } from './core/services/data-view.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatTabsModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly dataViewService = inject(DataViewService);

  protected readonly reportModalOpen = signal(false);
  protected readonly reportSubmitting = signal(false);
  protected readonly reportEmployeeId = signal('');
  protected readonly reportSpentHours = signal('');
  protected readonly reportDescription = signal('');
  protected readonly reportErrorMessage = signal('');
  protected readonly reportUserFieldError = signal(false);

  protected readonly employeeIdInvalid = signal(false);
  protected readonly spentHoursInvalid = signal(false);
  protected readonly descriptionInvalid = signal(false);

  protected openReportModal(): void {
    this.reportModalOpen.set(true);
    this.reportSubmitting.set(false);
    this.reportEmployeeId.set('');
    this.reportSpentHours.set('');
    this.reportDescription.set('');
    this.reportErrorMessage.set('');
    this.reportUserFieldError.set(false);
    this.employeeIdInvalid.set(false);
    this.spentHoursInvalid.set(false);
    this.descriptionInvalid.set(false);
  }

  protected closeReportModal(): void {
    if (this.reportSubmitting()) {
      return;
    }

    this.reportModalOpen.set(false);
  }

  protected closeReportErrorBanner(): void {
    this.reportErrorMessage.set('');
  }

  protected onReportEmployeeIdInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.reportEmployeeId.set(input.value);
    this.employeeIdInvalid.set(false);
    this.reportUserFieldError.set(false);
    if (this.reportErrorMessage()) {
      this.reportErrorMessage.set('');
    }
  }

  protected onReportSpentHoursInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.reportSpentHours.set(input.value);
    this.spentHoursInvalid.set(false);
  }

  protected onReportDescriptionInput(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.reportDescription.set(input.value);
    this.descriptionInvalid.set(false);
  }

  protected submitReport(): void {
    const employeeId = Number(this.reportEmployeeId());
    const spentHours = Number(this.reportSpentHours());
    const description = this.reportDescription().trim();

    const invalidEmployeeId = !Number.isFinite(employeeId) || employeeId <= 0;
    const invalidSpentHours = !Number.isFinite(spentHours) || spentHours <= 0;
    const invalidDescription = description.length === 0;

    this.employeeIdInvalid.set(invalidEmployeeId);
    this.spentHoursInvalid.set(invalidSpentHours);
    this.descriptionInvalid.set(invalidDescription);

    if (invalidEmployeeId || invalidSpentHours || invalidDescription) {
      return;
    }

    this.reportSubmitting.set(true);
    this.reportErrorMessage.set('');
    this.reportUserFieldError.set(false);

    this.dataViewService
      .createReport({ description, employeeId, spentHours })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          const message = this.readApiErrorMessage(error);
          const userNotFound =
            message.toLowerCase().includes('usuario') ||
            message.toLowerCase().includes('usuário') ||
            message.toLowerCase().includes('user') ||
            error.status === 404 ||
            error.status === 400;

          if (userNotFound) {
            this.reportErrorMessage.set('Não existe usuário com este id');
            this.reportUserFieldError.set(true);
          } else {
            this.reportErrorMessage.set(message || 'Não foi possível criar o lançamento.');
          }

          return of(void 0);
        }),
        finalize(() => {
          this.reportSubmitting.set(false);
        })
      )
      .subscribe(() => {
        if (this.reportErrorMessage()) {
          return;
        }

        this.reportModalOpen.set(false);
      });
  }

  private readApiErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string') {
      return error.error;
    }

    if (error.error && typeof error.error.message === 'string') {
      return error.error.message;
    }

    if (error.error && typeof error.error.title === 'string') {
      return error.error.title;
    }

    return '';
  }
}
