import { TestBed } from '@angular/core/testing';

import { FiwareService } from './fiware.service';

describe('FiwareService', () => {
  let service: FiwareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiwareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
