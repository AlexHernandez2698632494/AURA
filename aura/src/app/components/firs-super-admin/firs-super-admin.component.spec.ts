import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirsSuperAdminComponent } from './firs-super-admin.component';

describe('FirsSuperAdminComponent', () => {
  let component: FirsSuperAdminComponent;
  let fixture: ComponentFixture<FirsSuperAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirsSuperAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirsSuperAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
