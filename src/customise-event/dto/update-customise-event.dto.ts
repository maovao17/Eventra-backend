import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomiseEventDto } from './create-customise-event.dto';

export class UpdateCustomiseEventDto extends PartialType(CreateCustomiseEventDto) {}
