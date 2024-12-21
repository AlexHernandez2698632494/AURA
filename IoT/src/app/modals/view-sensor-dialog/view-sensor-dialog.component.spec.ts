import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSensorDialogComponent } from './view-sensor-dialog.component';

describe('ViewSensorDialogComponent', () => {
  let component: ViewSensorDialogComponent;
  let fixture: ComponentFixture<ViewSensorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSensorDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSensorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
