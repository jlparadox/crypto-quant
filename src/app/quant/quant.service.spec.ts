import { TestBed, inject } from '@angular/core/testing';

import { QuantService } from './quant.service';

describe('QuantService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuantService]
    });
  });

  it('should be created', inject([QuantService], (service: QuantService) => {
    expect(service).toBeTruthy();
  }));
});
