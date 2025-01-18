import { TestBed } from '@angular/core/testing';

import { TerminationSignalrService } from './termination-signalr.service';

describe('TerminationSignalrService', () => {
  let service: TerminationSignalrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TerminationSignalrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
