import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { SquadTableView } from '../../core/models/data-view.models';
import { DataViewService } from '../../core/services/data-view.service';

@Component({
  selector: 'app-squad-data-view',
  imports: [CommonModule, RouterLink],
  templateUrl: './squad-data-view.component.html',
  styleUrl: './squad-data-view.component.scss'
})
export class SquadDataViewComponent implements OnInit {
  private readonly dataViewService = inject(DataViewService);

  protected readonly loading = signal(true);
  protected readonly squads = signal<SquadTableView[]>([]);
  protected readonly hasError = signal(false);
  protected readonly createModalOpen = signal(false);
  protected readonly squadName = signal('');
  protected readonly createSubmitting = signal(false);
  protected readonly createTouched = signal(false);
  protected readonly createErrorMessage = signal('');

  protected readonly hasNoSquadData = computed(() => !this.loading() && this.squads().length === 0);
  protected readonly squadNameInvalid = computed(
    () => this.createTouched() && this.squadName().trim().length === 0
  );

  ngOnInit(): void {
    this.loadSquads();
  }

  protected openCreateModal(): void {
    this.createModalOpen.set(true);
    this.squadName.set('');
    this.createTouched.set(false);
    this.createErrorMessage.set('');
  }

  protected closeCreateModal(): void {
    if (this.createSubmitting()) {
      return;
    }

    this.createModalOpen.set(false);
  }

  protected onSquadNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.squadName.set(input.value);

    if (this.createErrorMessage()) {
      this.createErrorMessage.set('');
    }
  }

  protected submitCreateSquad(): void {
    this.createTouched.set(true);

    const name = this.squadName().trim();
    if (!name) {
      return;
    }

    this.createSubmitting.set(true);
    this.createErrorMessage.set('');

    this.dataViewService
      .createSquad({ name })
      .pipe(
        catchError(() => {
          this.createErrorMessage.set('Nao foi possivel criar o squad. Tente novamente.');
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
        this.loadSquads();
      });
  }

  private loadSquads(): void {
    this.loading.set(true);
    this.hasError.set(false);

    this.dataViewService
      .getSquadTableView()
      .pipe(
        catchError(() => {
          this.hasError.set(true);
          return of([]);
        }),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe((squads) => {
        this.squads.set(squads);
      });
  }
}
