import { Test, TestingModule } from '@nestjs/testing';
import { PlantUserController } from './plant-user.controller';

describe('PlantUserController', () => {
  let controller: PlantUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlantUserController],
    }).compile();

    controller = module.get<PlantUserController>(PlantUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
