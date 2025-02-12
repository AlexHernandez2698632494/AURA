import { TestBed } from '@angular/core/testing';

import { PaymentUserService } from './payment-user.service';

describe('PaymentUserService', () => {
  let service: PaymentUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
