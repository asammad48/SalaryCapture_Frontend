import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, ViewChild } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'daily-planning-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  imports: [ConfirmDialogModule, CommonModule],
})
export class ConfirmationDialogComponent implements AfterViewInit {
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
}
