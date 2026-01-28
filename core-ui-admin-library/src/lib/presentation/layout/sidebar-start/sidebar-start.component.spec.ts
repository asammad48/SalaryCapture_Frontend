import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarStartComponent } from './sidebar-start.component';

describe('SidebarStartComponent', () => {
  let component: SidebarStartComponent;
  let fixture: ComponentFixture<SidebarStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarStartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
