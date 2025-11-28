import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarEndComponent } from './sidebar-end.component';

describe('SidebarEndComponent', () => {
  let component: SidebarEndComponent;
  let fixture: ComponentFixture<SidebarEndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarEndComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarEndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
