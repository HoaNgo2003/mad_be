import { Test, TestingModule } from '@nestjs/testing';
import { UserPlantController } from './plant-user.controller';

describe('PlantUserController', () => {
  let controller: UserPlantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserPlantController],
    }).compile();

    controller = module.get<UserPlantController>(UserPlantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
