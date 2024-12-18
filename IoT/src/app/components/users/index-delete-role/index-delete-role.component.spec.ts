import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexDeleteRoleComponent } from './index-delete-role.component';

describe('IndexDeleteRoleComponent', () => {
  let component: IndexDeleteRoleComponent;
  let fixture: ComponentFixture<IndexDeleteRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexDeleteRoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexDeleteRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
