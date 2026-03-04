import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// clubId comes from @Param, userId comes from JWT — do NOT expose them in the body
export class CreateMembershipDto {
  @ApiProperty({ example: 'Em muốn học hỏi thêm về lập trình' })
  @IsNotEmpty()
  join_reason: string;

  @ApiProperty({ example: 'JavaScript, NestJS, React' })
  @IsNotEmpty()
  skills: string;

  @ApiProperty({ example: 'Em hứa sẽ tham gia đầy đủ các buổi sinh hoạt' })
  @IsNotEmpty()
  promise: string;
}
