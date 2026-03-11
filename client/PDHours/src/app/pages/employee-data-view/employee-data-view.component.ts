import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { EmployeeTableView } from '../../core/models/data-view.models';
import { EmployeeService } from '../../core/services/employee.service';
import { SquadService } from '../../core/services/squad.service';

@Component({
  selector: 'app-employee-data-view',
  imports: [CommonModule],
  templateUrl: './employee-data-view.component.html',
  styleUrl: './employee-data-view.component.scss'
})
export class EmployeeDataViewComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly squadService = inject(SquadService);
  private static readonly CREATE_EMPLOYEE_ERROR = 'Nao foi possivel criar o usuario.';
  private static readonly CREATE_SQUAD_ERROR = 'Nao foi possivel criar a squad.';

  protected readonly loading = signal(true);
  protected readonly employees = signal<EmployeeTableView[]>([]);
  protected readonly hasError = signal(false);
  protected readonly hasNoSquads = signal(false);

  protected readonly createModalOpen = signal(false);
  protected readonly createSubmitting = signal(false);
  protected readonly createUserName = signal('');
  protected readonly createEstimatedHours = signal('');
  protected readonly createSquadId = signal('');
  protected readonly createErrorMessage = signal('');

  protected readonly createSquadModalOpen = signal(false);
  protected readonly createSquadSubmitting = signal(false);
  protected readonly createSquadName = signal('');
  protected readonly createSquadErrorMessage = signal('');

  protected readonly userNameInvalid = signal(false);
  protected readonly estimatedHoursInvalid = signal(false);
  protected readonly squadIdInvalid = signal(false);
  protected readonly createSquadNameInvalid = signal(false);

  ngOnInit(): void {
    this.loadEmployees();
  }

  protected openCreateModal(): void {
    this.createModalOpen.set(true);
    this.resetCreateEmployeeFormState();
  }

  protected closeCreateModal(): void {
    if (this.createSubmitting()) {
      return;
    }

    this.createModalOpen.set(false);
  }

  protected openCreateSquadModal(): void {
    this.createSquadModalOpen.set(true);
    this.resetCreateSquadFormState();
  }

  protected closeCreateSquadModal(): void {
    if (this.createSquadSubmitting()) {
      return;
    }

    this.createSquadModalOpen.set(false);
  }

  protected closeCreateErrorBanner(): void {
    this.createErrorMessage.set('');
  }

  protected onCreateUserNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.createUserName.set(input.value);
    this.userNameInvalid.set(false);
    this.clearCreateEmployeeErrorMessage();
  }

  protected onCreateEstimatedHoursInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.createEstimatedHours.set(input.value);
    this.estimatedHoursInvalid.set(false);
    this.clearCreateEmployeeErrorMessage();
  }

  protected onCreateSquadIdInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.createSquadId.set(input.value);
    this.squadIdInvalid.set(false);
    this.clearCreateEmployeeErrorMessage();
  }

  protected onCreateSquadNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.createSquadName.set(input.value);
    this.createSquadNameInvalid.set(false);
    if (this.createSquadErrorMessage()) {
      this.createSquadErrorMessage.set('');
    }
  }

  protected submitCreateEmployee(): void {
    const name = this.createUserName().trim();
    const estimateHours = Number(this.createEstimatedHours());
    const squadId = Number(this.createSquadId().trim());

    this.createSubmitting.set(true);
    this.createErrorMessage.set('');
    this.userNameInvalid.set(false);
    this.estimatedHoursInvalid.set(false);
    this.squadIdInvalid.set(false);

    this.employeeService
      .createEmployee({ name, estimateHours, squadId })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleCreateEmployeeError(error);
          return of(void 0);
        }),
        finalize(() => {
          this.createSubmitting.set(false);
        })
      )
      .subscribe(() => {
        if (!this.createErrorMessage()) {
          this.createModalOpen.set(false);
          this.loadEmployees();
        }
      });
  }

  protected submitCreateSquad(): void {
    const name = this.createSquadName().trim();

    this.createSquadSubmitting.set(true);
    this.createSquadErrorMessage.set('');

    this.squadService
      .createSquad({ name })
      .pipe(
        catchError(() => {
          this.createSquadErrorMessage.set(EmployeeDataViewComponent.CREATE_SQUAD_ERROR);
          return of(void 0);
        }),
        finalize(() => {
          this.createSquadSubmitting.set(false);
        })
      )
      .subscribe(() => {
        if (!this.createSquadErrorMessage()) {
          this.createSquadModalOpen.set(false);
          this.loadEmployees();
        }
      });
  }

  private loadEmployees(): void {
    this.loading.set(true);
    this.hasError.set(false);
    this.hasNoSquads.set(false);

    forkJoin({
      squads: this.squadService.getSquadsList().pipe(catchError(() => of([]))),
      employees: this.employeeService.getEmployeeTableView().pipe(catchError(() => of([])))
    })
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe(({ squads, employees }) => {
        this.hasNoSquads.set(squads.length === 0);
        this.hasError.set(squads.length === 0 && employees.length === 0);
        this.employees.set(employees);
      });
  }

  private resetCreateEmployeeFormState(): void {
    this.createSubmitting.set(false);
    this.createUserName.set('');
    this.createEstimatedHours.set('');
    this.createSquadId.set('');
    this.createErrorMessage.set('');
    this.userNameInvalid.set(false);
    this.estimatedHoursInvalid.set(false);
    this.squadIdInvalid.set(false);
  }

  private resetCreateSquadFormState(): void {
    this.createSquadSubmitting.set(false);
    this.createSquadName.set('');
    this.createSquadErrorMessage.set('');
    this.createSquadNameInvalid.set(false);
  }

  private clearCreateEmployeeErrorMessage(): void {
    if (this.createErrorMessage()) {
      this.createErrorMessage.set('');
    }
  }

  private handleCreateEmployeeError(error: HttpErrorResponse): void {
    const errorMessage = this.readApiErrorMessage(error);
    const squadNotFoundError = this.isSquadNotFoundError(errorMessage) || error.status === 404;

    if (squadNotFoundError) {
      const squadMessage = errorMessage || 'Nao existe squad com este id.';
      this.createErrorMessage.set(squadMessage);
      this.squadIdInvalid.set(true);
      return;
    }

    if (this.isEstimateHoursRangeError(errorMessage)) {
      this.estimatedHoursInvalid.set(true);
    }

    this.createErrorMessage.set(errorMessage || EmployeeDataViewComponent.CREATE_EMPLOYEE_ERROR);
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

  private isSquadNotFoundError(message: string): boolean {
    const normalizedMessage = message.toLowerCase();
    return (
      normalizedMessage.includes('squad') &&
      (normalizedMessage.includes('nao existe') ||
        normalizedMessage.includes('not found') ||
        normalizedMessage.includes('does not exist'))
    );
  }

  private isEstimateHoursRangeError(message: string): boolean {
    const normalizedMessage = message.toLowerCase();
    return (
      normalizedMessage.includes('estimate') &&
      normalizedMessage.includes('hour') &&
      (normalizedMessage.includes('1') || normalizedMessage.includes('12'))
    );
  }
}
