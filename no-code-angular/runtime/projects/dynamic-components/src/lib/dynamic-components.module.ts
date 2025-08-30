
        import { NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';
        import { FormsModule } from '@angular/forms';
        import { HomePageComponent } from './generated/homePage/homePage.component';

        @NgModule({
          imports: [CommonModule, FormsModule],
          declarations: [
            HomePageComponent
          ],
          exports: [
            HomePageComponent
          ]
        })
        export class DynamicComponentsModule {}
            