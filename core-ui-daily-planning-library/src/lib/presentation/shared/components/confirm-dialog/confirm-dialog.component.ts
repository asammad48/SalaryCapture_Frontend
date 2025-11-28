import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, ViewChild } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressLoadingComponent } from '../progress-loading/progress-loading.component';

@Component({
  selector: 'salary-calculation-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  imports: [ConfirmDialogModule, CommonModule, ProgressLoadingComponent],
})
export class ConfirmDialogComponent implements AfterViewInit {

  data: string[] = [];
  confirmation!: string;
  
  @ViewChild('confirmBtn') confirmBtn: any;
  private keyPressed: string | null = null;
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    const { messages = [], confirmation = '' } = this.config.data || {};
    this.data = messages;
    this.confirmation = confirmation;
  }

  ngAfterViewInit(): void {
    // this.confirmBtn.nativeElement.focus();
  }

  @HostListener('keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.keyPressed = event.key;
    }
  }
  
  closeModal(isConfirm: boolean) {
    this.ref.close({
      confirmed: isConfirm,
      key: this.keyPressed
    });
  }

  confirmModal() {

    this.config.data?.onConfirm({
      confirmed: true,
      key: this.keyPressed
    })

  }

}
