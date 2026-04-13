import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @MinLength(2, { message: 'Tên danh mục phải có ít nhất 2 ký tự' })
  name: string;
}

export class UpdateCategoryDto extends CreateCategoryDto {}
