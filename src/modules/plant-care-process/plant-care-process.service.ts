import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantCareProcess } from './entities/plant-care-process.entity';
import { CreatePlantCareProcessDto } from './dtos/create-plan-care-process.dto';
import { PlantListTaskService } from '../plant-list-task/plan-list-task.service';
import { Plant } from '../plant/entities/plant.entity';

@Injectable()
export class PlantCareProcessService extends BaseMySqlService<PlantCareProcess> {
  constructor(
    @InjectRepository(PlantCareProcess)
    private readonly repo: Repository<PlantCareProcess>,
    private readonly listTaskService: PlantListTaskService,
  ) {
    super(repo);
  }

  async createOnePlantCareProcess(
    dto: CreatePlantCareProcessDto,
    plant: Plant,
  ) {
    const { list_tasks } = dto;
    delete dto.list_tasks;
    const plantCareProcess = await this.createOne({ ...dto, plant });
    const listTaskDtos = list_tasks.map((task) => ({
      ...task,
      process: plantCareProcess,
    }));
    const taskDatas = await this.listTaskService.createMany(listTaskDtos);
    plantCareProcess.list_tasks = taskDatas;
    return plantCareProcess;
  }

  async createManyPlantCareProcesses(
    dtos: CreatePlantCareProcessDto[],
    plant: Plant,
  ) {
    const createdProcesses = [];

    for (const dto of dtos) {
      const { list_tasks } = dto;
      delete dto.list_tasks;

      // Create and save PlantCareProcess
      const plantCareProcess = await this.createOne({ ...dto, plant });

      if (list_tasks && list_tasks.length > 0) {
        const listTaskDtos = list_tasks.map((task) => ({
          ...task,
          process: plantCareProcess,
        }));

        // Create and save associated list tasks
        const taskDatas = await this.listTaskService.createMany(listTaskDtos);
        plantCareProcess.list_tasks = taskDatas;
      }

      createdProcesses.push(plantCareProcess);
    }

    return createdProcesses;
  }
}
