import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plant } from './entities/plant.entity';
import { CreatePlantDto } from './dtos/create-plants.dto';
import { PlantBenefitService } from '../plant-benefit/plan-benefit.service';
import { UpdatePlantDto } from './dtos/update-plants.dto';
import { PlantCareProcessService } from '../plant-care-process/plant-care-process.service';

@Injectable()
export class PlantService extends BaseMySqlService<Plant> {
  constructor(
    @InjectRepository(Plant)
    private readonly repo: Repository<Plant>,
    private readonly plantBenefitService: PlantBenefitService,
    private readonly plantProcessService: PlantCareProcessService,
  ) {
    super(repo);
  }

  async createOnePlant(dto: CreatePlantDto) {
    let plant_benefits = [];
    let plant_processes = [];
    if (dto.plant_benefits) {
      plant_benefits = dto.plant_benefits;
      delete dto.plant_benefits;
    }
    if (dto.plant_processes) {
      plant_processes = dto.plant_processes;
      delete dto.plant_processes;
    }
    const plant = await this.createOne(dto);
    const dataProcess =
      await this.plantProcessService.createManyPlantCareProcesses(
        plant_processes,
        plant,
      );
    const plantBenefitDtos = plant_benefits.map((benefit) => ({
      ...benefit,
      plant: plant,
    }));
    plant_benefits =
      await this.plantBenefitService.createMany(plantBenefitDtos);
    if (plant_benefits) {
      plant.plant_benefits = plant_benefits;
    }
    plant.plant_processes = dataProcess;
    return plant;
  }

  async updateOnePlant(dto: UpdatePlantDto, id: string) {
    let plant_benefits = [];
    let plant_processes = [];

    if (dto.plant_benefits) {
      plant_benefits = dto.plant_benefits;
      delete dto.plant_benefits;
    }

    if (dto.plant_processes) {
      plant_processes = dto.plant_processes;
      delete dto.plant_processes;
    }

    // Step 1: Update the plant
    const plant = await this.updateOne(
      {
        filter: [{ field: 'id', operator: 'eq', value: id }],
      },
      dto,
    );

    // Step 2: Update/Create Plant Benefits
    if (plant_benefits.length > 0) {
      const plantBenefitDtos = plant_benefits.map((benefit) => ({
        ...benefit,
        plant: plant,
      }));
      const createdBenefits =
        await this.plantBenefitService.createMany(plantBenefitDtos);
      plant.plant_benefits = createdBenefits;
    }

    // Step 3: Update/Create Plant Care Processes with List Tasks
    if (plant_processes.length > 0) {
      const updatedProcesses =
        await this.plantProcessService.createManyPlantCareProcesses(
          plant_processes,
          plant,
        );
      plant.plant_processes = updatedProcesses;
    }

    return plant;
  }

  async createBulkPlants(dtos: CreatePlantDto[]) {
    const createdPlants = [];

    for (const dto of dtos) {
      let plant_benefits = [];
      let plant_processes = [];

      if (dto.plant_benefits) {
        plant_benefits = dto.plant_benefits;
        delete dto.plant_benefits;
      }

      if (dto.plant_processes) {
        plant_processes = dto.plant_processes;
        delete dto.plant_processes;
      }

      // Step 1: Create the plant
      const plant = await this.createOne(dto);

      // Step 2: Create Plant Benefits
      if (plant_benefits.length > 0) {
        const benefits = await this.plantBenefitService.createMany(
          plant_benefits.map((benefit) => ({
            ...benefit,
            plant: plant,
          })),
        );
        plant.plant_benefits = benefits;
      }

      // Step 3: Create Plant Care Processes with List Tasks
      if (plant_processes.length > 0) {
        const createdProcesses =
          await this.plantProcessService.createManyPlantCareProcesses(
            plant_processes,
            plant,
          );
        plant.plant_processes = createdProcesses;
      }

      createdPlants.push(plant);
    }

    return createdPlants;
  }
}
