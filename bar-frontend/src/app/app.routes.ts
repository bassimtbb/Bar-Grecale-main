import { Routes } from '@angular/router';

import { HomeComponent } from './Landing/home/home.component';
import { ManageComponent } from './manage/manage.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'manage', component: ManageComponent },
  { path: '**', redirectTo: '' },
];
