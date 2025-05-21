import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexEComponent } from './index-e.component';

describe('IndexEComponent', () => {
  let component: IndexEComponent;
  let fixture: ComponentFixture<IndexEComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexEComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexEComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
