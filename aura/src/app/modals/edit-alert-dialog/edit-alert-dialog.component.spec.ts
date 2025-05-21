import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAlertDialogComponent } from './edit-alert-dialog.component';

describe('EditAlertDialogComponent', () => {
  let component: EditAlertDialogComponent;
  let fixture: ComponentFixture<EditAlertDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAlertDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAlertDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
