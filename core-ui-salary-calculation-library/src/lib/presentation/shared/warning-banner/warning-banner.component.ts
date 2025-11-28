import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-warning-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './warning-banner.component.html',
  styleUrls: ['./warning-banner.component.scss'],

})
export class WarningBannerComponent {
  
  @Input() title = 'Warning';
  @Input() message = '';
  @Input() icon = 'fa-exclamation-circle';
  @Input() show = true;
  @Input() id = '';
  @Input() customClass = '';
  @Input() severity = 'error'


}
