import { ApiProperty } from '@dataui/crud/lib/crud';
import { IsNotEmpty, IsString, IsUUID, Validate } from 'class-validator';

export class ParamIdPlantBenefitDto {
  @ApiProperty()
  //   @Validate(IsPlantExistContraints, [{ field: 'id' }], {
  //     message: 'Plant not found',
  //   })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  id: string;
}
