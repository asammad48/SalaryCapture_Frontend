import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, ViewChild } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

export enum FuturePlansDialogAction {
  Update = 'update',
  DoNotUpdate = 'doNotUpdate',
  Cancel = 'cancel'
}

export interface FuturePlansDialogResult {
  action: FuturePlansDialogAction;
  key: string | null;
}

@Component({
  selector: 'daily-planning-future-plans-dialog',
  templateUrl: './future-plans-dialog.component.html',
  imports: [ConfirmDialogModule, CommonModule],
})
export class FuturePlansDialogComponent implements AfterViewInit {

  readonly FuturePlansDialogAction = FuturePlansDialogAction;
  
  data: string[] = [];
  confirmation!: string;
  @ViewChild('updateBtn') updateBtn: any;
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
    // this.updateBtn.nativeElement.focus();
  }

  @HostListener('keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.keyPressed = event.key;
    }
  }

  closeModal(action: FuturePlansDialogAction): void {
    const result: FuturePlansDialogResult = {
      action: action,
      key: this.keyPressed
    };
    this.ref.close(result);
  }
}
