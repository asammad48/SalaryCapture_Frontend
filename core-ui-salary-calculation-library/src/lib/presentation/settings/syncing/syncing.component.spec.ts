import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SyncingComponent } from './syncing.component';

describe('SyncingComponent', () => {
  let component: SyncingComponent;
  let fixture: ComponentFixture<SyncingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyncingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SyncingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
