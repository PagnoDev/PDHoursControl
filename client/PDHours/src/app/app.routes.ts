import { Routes } from '@angular/router';
import { EmployeeDataViewComponent } from './pages/employee-data-view/employee-data-view.component';
import { SquadDetailsViewComponent } from './pages/squad-details-view/squad-details-view.component';
import { SquadDataViewComponent } from './pages/squad-data-view/squad-data-view.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'EmployeeDataView' },
  { path: 'EmployeeDataView', component: EmployeeDataViewComponent },
  { path: 'Squad/DataView', component: SquadDataViewComponent },
  { path: 'Squad/Details/:id', component: SquadDetailsViewComponent },
  { path: '**', redirectTo: 'EmployeeDataView' }
];
