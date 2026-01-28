import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarStartComponent, HeaderComponent, UsersService } from '@embrace-it/admin-library';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-dps',
  imports: [CommonModule, RouterOutlet, SidebarStartComponent, HeaderComponent, Toast],
  templateUrl: './dps.component.html',
  providers: [UsersService]
})

export class DpsComponent {

}
