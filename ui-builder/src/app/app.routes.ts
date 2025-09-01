import { Routes } from '@angular/router';
import { GeneratedPageComponent } from './generated/generated-page/generated-page.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'preview', component: GeneratedPageComponent }
];
