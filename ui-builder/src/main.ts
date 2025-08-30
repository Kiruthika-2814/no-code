import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component'; // Ensure correct import

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    // Add other providers if needed (e.g., for routing, animations)
  ]
}).catch(err => console.error(err));