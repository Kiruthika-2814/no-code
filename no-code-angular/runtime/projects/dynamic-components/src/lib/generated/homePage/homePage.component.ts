
import { Component } from '@angular/core';

@Component({
  selector: 'app-homePage',
  templateUrl: './homePage.component.html',
  styleUrls: ['./homePage.component.scss']
})
export class HomePageComponent {
  comp_6no3c7b7vSelected: string = 'Male';
  comp_phmdr0e0bChecked: boolean = false;
  comp_cse0wy5kjSelected: string = 'Option 1';
  comp_cos38aqx6Model: string = '';
  comp_2baiyp9x9Model: string = '';

  handleGetStarted() { console.log('comp-pf5dsyz92 clicked'); }
}