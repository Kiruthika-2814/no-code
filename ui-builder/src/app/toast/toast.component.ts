import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  @Input() message = '';
  @Input() visible: boolean = false;

  hideAfter(ms: number = 2000) {
    setTimeout(() => {
      this.visible = false;
    }, ms);
  }
}
