import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideLoginComponent } from './side-login.component';

describe('SideLoginComponent', () => {
  let component: SideLoginComponent;
  let fixture: ComponentFixture<SideLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
