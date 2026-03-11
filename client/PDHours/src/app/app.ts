import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { ReportService } from './core/services/report.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatTabsModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly reportService = inject(ReportService);

  private static readonly USER_NOT_FOUND_ERROR = 'Nao existe usuario com este id';
  private static readonly REPORT_CREATE_ERROR = 'Nao foi possivel criar o lancamento.';

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
    this.resetReportFormState();
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
    this.clearReportErrorMessage();
  }

  protected onReportSpentHoursInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.reportSpentHours.set(input.value);
    this.spentHoursInvalid.set(false);
    this.clearReportErrorMessage();
  }

  protected onReportDescriptionInput(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.reportDescription.set(input.value);
    this.descriptionInvalid.set(false);
    this.clearReportErrorMessage();
  }

  protected submitReport(): void {
    const employeeId = Number(this.reportEmployeeId());
    const spentHours = Number(this.reportSpentHours());
    const description = this.reportDescription().trim();

    this.reportSubmitting.set(true);
    this.employeeIdInvalid.set(false);
    this.spentHoursInvalid.set(false);
    this.descriptionInvalid.set(false);
    this.reportUserFieldError.set(false);
    this.reportErrorMessage.set('');

    this.reportService
      .createReport({ description, employeeId, spentHours })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleCreateReportError(error);
          return of(void 0);
        }),
        finalize(() => {
          this.reportSubmitting.set(false);
        })
      )
      .subscribe(() => {
        if (!this.reportErrorMessage()) {
          this.reportModalOpen.set(false);
        }
      });
  }

  private resetReportFormState(): void {
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

  private clearReportErrorMessage(): void {
    if (this.reportErrorMessage()) {
      this.reportErrorMessage.set('');
    }
  }

  private handleCreateReportError(error: HttpErrorResponse): void {
    const errorMessage = this.readApiErrorMessage(error);
    const isUserNotFoundError = this.isUserNotFoundError(errorMessage) || error.status === 404;

    if (isUserNotFoundError) {
      this.reportErrorMessage.set(errorMessage || App.USER_NOT_FOUND_ERROR);
      this.reportUserFieldError.set(true);
      return;
    }

    this.reportErrorMessage.set(errorMessage || App.REPORT_CREATE_ERROR);
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

    if (error.error && typeof error.error.detail === 'string') {
      return error.error.detail;
    }

    if (error.error && typeof error.error === 'object' && error.error.errors) {
      const validationErrors = Object.values(error.error.errors)
        .flat()
        .filter((value): value is string => typeof value === 'string');

      if (validationErrors.length > 0) {
        return validationErrors[0];
      }
    }

    return '';
  }

  private isUserNotFoundError(message: string): boolean {
    const normalizedMessage = message.toLowerCase();
    return (
      (normalizedMessage.includes('usuario') || normalizedMessage.includes('user')) &&
      (normalizedMessage.includes('nao existe') ||
        normalizedMessage.includes('not found') ||
        normalizedMessage.includes('does not exist'))
    );
  }
}
