// app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DynamicComponentsModule } from 'dynamic-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DynamicComponentsModule],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}