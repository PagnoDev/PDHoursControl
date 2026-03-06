import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { DataViewService } from '../../core/services/data-view.service';
import { EmployeeTableView } from '../../core/models/data-view.models';

@Component({
  selector: 'app-employee-data-view',
  imports: [CommonModule],
  templateUrl: './employee-data-view.component.html',
  styleUrl: './employee-data-view.component.scss'
})
export class EmployeeDataViewComponent implements OnInit {
  private readonly dataViewService = inject(DataViewService);

  protected readonly loading = signal(true);
  protected readonly employees = signal<EmployeeTableView[]>([]);
  protected readonly hasError = signal(false);
  protected readonly hasNoSquads = signal(false);
  protected readonly createModalOpen = signal(false);
  protected readonly createSubmitting = signal(false);
  protected readonly createTouched = signal(false);
  protected readonly createUserName = signal('');
  protected readonly createEstimatedHours = signal('');
  protected readonly createSquadId = signal('');
  protected readonly createErrorMessage = signal('');
  protected readonly squadFieldError = signal(false);
  protected readonly createSquadModalOpen = signal(false);
  protected readonly createSquadSubmitting = signal(false);
  protected readonly createSquadTouched = signal(false);
  protected readonly createSquadName = signal('');
  protected readonly createSquadErrorMessage = signal('');

  protected readonly userNameInvalid = signal(false);
  protected readonly estimatedHoursInvalid = signal(false);
  protected readonly createSquadNameInvalid = signal(false);

  ngOnInit(): void {
    this.loadEmployees();
  }

  protected openCreateModal(): void {
    this.createModalOpen.set(true);
    this.createSubmitting.set(false);
    this.createTouched.set(false);
    this.createUserName.set('');
    this.createEstimatedHours.set('');
    this.createSquadId.set('');
    this.createErrorMessage.set('');
    this.squadFieldError.set(false);
    this.userNameInvalid.set(false);
    this.estimatedHoursInvalid.set(false);
  }

  protected closeCreateModal(): void {
    if (this.createSubmitting()) {
      return;
    }

    this.createModalOpen.set(false);
  }

  protected openCreateSquadModal(): void {
    this.createSquadModalOpen.set(true);
    this.createSquadSubmitting.set(false);
    this.createSquadTouched.set(false);
    this.createSquadName.set('');
    this.createSquadErrorMessage.set('');
    this.createSquadNameInvalid.set(false);
  }

  protected closeCreateSquadModal(): void {
    if (this.createSquadSubmitting()) {
      return;
    }

    this.createSquadModalOpen.set(false);
  }

  protected onCreateSquadNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.createSquadName.set(input.value);
    this.createSquadNameInvalid.set(false);
    if (this.createSquadErrorMessage()) {
      this.createSquadErrorMessage.set('');
    }
  }

  protected submitCreateSquad(): void {
    this.createSquadTouched.set(true);

    const name = this.createSquadName().trim();
    const invalidName = name.length === 0;
    this.createSquadNameInvalid.set(invalidName);

    if (invalidName) {
      return;
    }

    this.createSquadSubmitting.set(true);
    this.createSquadErrorMessage.set('');

    this.dataViewService
      .createSquad({ name })
      .pipe(
        catchError(() => {
          this.createSquadErrorMessage.set('Nao foi possivel criar a squad.');
          return of(void 0);
        }),
        finalize(() => {
          this.createSquadSubmitting.set(false);
        })
      )
      .subscribe(() => {
        if (this.createSquadErrorMessage()) {
          return;
        }

        this.createSquadModalOpen.set(false);
        this.loadEmployees();
      });
  }

  protected closeCreateErrorBanner(): void {
    this.createErrorMessage.set('');
  }

  protected onCreateUserNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.createUserName.set(input.value);
    this.userNameInvalid.set(false);
  }

  protected onCreateEstimatedHoursInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.createEstimatedHours.set(input.value);
    this.estimatedHoursInvalid.set(false);
  }

  protected onCreateSquadIdInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.createSquadId.set(input.value);
    this.squadFieldError.set(false);
    if (this.createErrorMessage()) {
      this.createErrorMessage.set('');
    }
  }

  protected submitCreateEmployee(): void {
    this.createTouched.set(true);

    const name = this.createUserName().trim();
    const estimateHours = Number(this.createEstimatedHours());
    const squadId = Number(this.createSquadId());

    const invalidName = name.length === 0;
    const invalidHours = !Number.isFinite(estimateHours) || estimateHours <= 0;
    const invalidSquadId = !Number.isFinite(squadId) || squadId <= 0;

    this.userNameInvalid.set(invalidName);
    this.estimatedHoursInvalid.set(invalidHours);
    this.squadFieldError.set(invalidSquadId);

    if (invalidName || invalidHours || invalidSquadId) {
      return;
    }

    this.createSubmitting.set(true);
    this.createErrorMessage.set('');

    this.dataViewService
      .createEmployee({
        name,
        estimateHours,
        squadId
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          const apiMessage = this.readApiErrorMessage(error);
          const squadNotFound =
            this.isSquadNotFoundError(apiMessage) || error.status === 404 || error.status === 400;

          if (squadNotFound) {
            this.createErrorMessage.set('nao existe squad com este id');
            this.squadFieldError.set(true);
          } else {
            this.createErrorMessage.set(apiMessage || 'Nao foi possivel criar o usuario.');
          }

          return of(void 0);
        }),
        finalize(() => {
          this.createSubmitting.set(false);
        })
      )
      .subscribe(() => {
        if (this.createErrorMessage()) {
          return;
        }

        this.createModalOpen.set(false);
        this.loadEmployees();
      });
  }

  private loadEmployees(): void {
    this.loading.set(true);
    this.hasError.set(false);
    this.hasNoSquads.set(false);

    forkJoin({
      squads: this.dataViewService.getSquadsList().pipe(catchError(() => of([]))),
      employees: this.dataViewService.getEmployeeTableView().pipe(catchError(() => of([])))
    })
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe(({ squads, employees }) => {
        this.hasError.set(squads.length === 0 && employees.length === 0);
        this.hasNoSquads.set(squads.length === 0);
        this.employees.set(employees);
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

  private isSquadNotFoundError(message: string): boolean {
    const normalized = message.toLowerCase();
    return (
      normalized.includes('squad') &&
      (normalized.includes('nao existe') ||
        normalized.includes('não existe') ||
        normalized.includes('not found') ||
        normalized.includes('does not exist'))
    );
  }
}
