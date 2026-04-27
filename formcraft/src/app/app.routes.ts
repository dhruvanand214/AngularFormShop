import { Routes } from '@angular/router';
import { BuilderComponent } from './features/builder/builder.component';
import { ExportComponent } from './features/export/export.component';
import { AuthComponent } from './features/auth/auth.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: AuthComponent },
  { path: 'builder', component: BuilderComponent },
  { path: 'builder/:id', component: BuilderComponent },
  { path: 'export', component: ExportComponent },
  { path: 'export/:id', component: ExportComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '' }
];
