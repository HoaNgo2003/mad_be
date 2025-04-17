import { IsString, IsNotEmpty, Validate, IsUUID } from 'class-validator';
import { ApiProperty } from '@dataui/crud/lib/crud';
import {
  IsPlantBenefitExistContraints,
  IsPlantExistContraints,
} from 'src/common/validators/plant.validate';

export class ParamIdPlantDto {
  @ApiProperty()
  @Validate(IsPlantExistContraints, [{ field: 'id' }], {
    message: 'Plant not found',
  })
  // @IsUUID()
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class ParamIdPlantBenefitDto {
  @ApiProperty()
  @Validate(IsPlantBenefitExistContraints, [{ field: 'id' }], {
    message: 'Benefit of plan not found',
  })
  // @IsUUID()
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class ParamIdCategory {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
