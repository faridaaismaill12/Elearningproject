import { Expose, Type } from 'class-transformer';

export class UserResponseDto {
    
  @Expose()
  userId!: string;

  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Expose()
  role!: string;

  @Expose()
  profilePictureUrl?: string;

  @Expose()
  bio?: string;

  @Expose()
  preferences?: Record<string, any>;

  @Expose()
  isActive: boolean = true;

  @Expose()
  lastLogin?: Date;

  @Expose()
  lastChangedPassword?: Date;

  @Expose()
  @Type( () => String)
  enrolledCourses?: string[];

}
