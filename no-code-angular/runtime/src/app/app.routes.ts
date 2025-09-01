
                import { Routes } from '@angular/router';
                import { HomePageComponent } from '../../projects/dynamic-components/src/lib/generated/homePage/homePage.component';

                export const routes: Routes = [
                  { path: 'homePage', component: HomePageComponent },
                  { path: '', redirectTo: 'homePage', pathMatch: 'full' }
                ];
                