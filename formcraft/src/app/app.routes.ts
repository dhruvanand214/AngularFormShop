import { Routes } from '@angular/router';
import { BuilderComponent } from './features/builder/builder.component';
import { ExportComponent } from './features/export/export.component';

export const routes: Routes = [
  { path: '', component: BuilderComponent },
  { path: 'export', component: ExportComponent },
  { path: '**', redirectTo: '' }
];
