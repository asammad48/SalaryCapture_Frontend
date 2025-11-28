import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'lib-reset-password',
    imports: [
        CommonModule,
    ],
    templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
  options:any;
  ref: any;
 
  constructor() { }
 
  ngOnInit(): void {
    this.openingHoursFunc();
  }



  openingHoursFunc() {

    this.options = [
      {name:'Admin'},
      {name:'Manager'},
      {name:'Super Manager'},
    ]
  }

  visible = false;

  closeModal(isConfirm: boolean) {
    this.ref.close(isConfirm);
  }
}

