import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-toast-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-banner.component.html',
  styleUrls: ['./toast-banner.component.scss'],

})
export class ToastBannerComponent {
  
  @Input() title = 'Warning';
  @Input() message = '';
  @Input() icon = 'fa-exclamation-circle';
  @Input() show = true;
  @Input() id = '';
  @Input() customClass = '';
  @Input() severity = 'error'
}
