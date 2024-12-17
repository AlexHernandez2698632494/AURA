import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexRoleComponent } from './index-role.component';

describe('IndexRoleComponent', () => {
  let component: IndexRoleComponent;
  let fixture: ComponentFixture<IndexRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexRoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
