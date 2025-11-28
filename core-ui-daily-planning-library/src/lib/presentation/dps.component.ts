import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {SidebarStartComponent} from '../../../../core-ui-salary-calculation-library/src/lib/presentation/layout/sidebar-start/sidebar-start.component';
import {HeaderComponent} from '../../../../core-ui-salary-calculation-library/src/lib/presentation/layout/header/header.component';
// import { SidebarStartComponent, HeaderComponent } from '../../../../core-ui-salary-calculation-library/src/lib/presentation/layout/index';
import { UsersService } from '../../../../core-ui-salary-calculation-library/src/lib/data/repositories/usersManagement/users.service';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-dps',
  imports: [CommonModule, RouterOutlet, SidebarStartComponent, HeaderComponent, Toast],
  templateUrl: './dps.component.html',
  providers: [UsersService]
})

export class DpsComponent {

}
