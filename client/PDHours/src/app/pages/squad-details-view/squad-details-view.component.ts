import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { SquadMemberTableView } from '../../core/models/data-view.models';
import { DataViewService } from '../../core/services/data-view.service';

@Component({
  selector: 'app-squad-details-view',
  imports: [CommonModule, RouterLink],
  templateUrl: './squad-details-view.component.html',
  styleUrl: './squad-details-view.component.scss'
})
export class SquadDetailsViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dataViewService = inject(DataViewService);
  private readonly today = this.toDateInputValue(new Date());

  protected readonly loading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly squadId = signal(0);
  protected readonly squadName = signal('Nome da Squad');
  protected readonly startDate = signal(this.today);
  protected readonly endDate = signal(this.today);
  protected readonly hasRegisteredEmployees = signal(false);
  protected readonly canFilterByDate = computed(
    () => this.hasRegisteredEmployees() && !this.loading() && !this.hasError()
  );
  protected readonly members = signal<SquadMemberTableView[]>([]);
  protected readonly totalHours = signal(0);
  protected readonly averageHoursPerDay = signal(0);

  ngOnInit(): void {
    const routeSquadId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.isValidPositiveNumber(routeSquadId)) {
      this.hasError.set(true);
      this.loading.set(false);
      return;
    }

    this.squadId.set(routeSquadId);
    this.loadSquadContextAndDetails();
  }

  protected onStartDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.startDate.set(input.value);
  }

  protected onEndDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.endDate.set(input.value);
  }

  protected openDatePicker(input: HTMLInputElement): void {
    if (input.disabled) {
      return;
    }

    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (pickerInput.showPicker) {
      pickerInput.showPicker();
      return;
    }

    input.focus();
    input.click();
  }

  protected applyDateFilter(): void {
    if (!this.canFilterByDate()) {
      return;
    }

    if (!this.startDate() || !this.endDate()) {
      return;
    }

    if (this.startDate() > this.endDate()) {
      return;
    }

    this.loadDetails();
  }

  protected formatCreatedAt(dateValue: string): string {
    if (!dateValue || dateValue === '-') {
      return '-';
    }

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return '-';
    }

    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private loadSquadContextAndDetails(): void {
    this.loading.set(true);
    this.hasError.set(false);

    this.dataViewService
      .getSquadTableView()
      .pipe(
        catchError(() => {
          this.hasError.set(true);
          this.loading.set(false);
          return of([]);
        })
      )
      .subscribe((squads) => {
        if (this.hasError()) {
          return;
        }

        const currentSquad = squads.find((squad) => squad.id === this.squadId());
        if (!currentSquad) {
          this.hasError.set(true);
          this.loading.set(false);
          return;
        }

        this.squadName.set(currentSquad.name || 'Nome da Squad');
        const hasEmployees = currentSquad.employeesCount > 0;
        this.hasRegisteredEmployees.set(hasEmployees);

        if (!hasEmployees) {
          this.members.set([]);
          this.totalHours.set(0);
          this.averageHoursPerDay.set(0);
          this.loading.set(false);
          return;
        }

        this.loadDetails();
      });
  }

  private loadDetails(): void {
    this.loading.set(true);
    this.hasError.set(false);

    forkJoin({
      members: this.dataViewService.getSquadMemberTableView(
        this.squadId(),
        this.startDate(),
        this.endDate()
      ),
      total: this.dataViewService.getSquadTotalHours(
        this.squadId(),
        this.startDate(),
        this.endDate()),
      average: this.dataViewService.getSquadDailyAverage(
        this.squadId(),
        this.startDate(),
        this.endDate()
      )
    })
      .pipe(
        catchError(() => {
          this.hasError.set(true);
          return of(null);
        }),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }

        this.members.set(result.members);
        this.totalHours.set(result.total.totalHours);
        this.averageHoursPerDay.set(result.average.averageHoursPerDay);
        this.squadName.set(result.average.name || 'Nome da Squad');
      });
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isValidPositiveNumber(value: number): boolean {
    return Number.isFinite(value) && value > 0;
  }
}
