import { PartialType } from '@nestjs/mapped-types';
import { CreateEventRegistrationDto } from './create-event_registration.dto';

export class UpdateEventRegistrationDto extends PartialType(
  CreateEventRegistrationDto,
) {}
