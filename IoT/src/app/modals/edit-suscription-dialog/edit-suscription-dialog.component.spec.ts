import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSuscriptionDialogComponent } from './edit-suscription-dialog.component';

describe('EditSuscriptionDialogComponent', () => {
  let component: EditSuscriptionDialogComponent;
  let fixture: ComponentFixture<EditSuscriptionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSuscriptionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSuscriptionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
