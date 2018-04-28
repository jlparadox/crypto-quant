import { TestBed, inject } from '@angular/core/testing';

import { DiscordService } from './discord.service';

describe('DiscordService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DiscordService]
    });
  });

  it('should be created', inject([DiscordService], (service: DiscordService) => {
    expect(service).toBeTruthy();
  }));
});
