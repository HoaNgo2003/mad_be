import { Test, TestingModule } from '@nestjs/testing';
import { PlantUserService } from './plant-user.service';

describe('PlantUserService', () => {
  let service: PlantUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlantUserService],
    }).compile();

    service = module.get<PlantUserService>(PlantUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
