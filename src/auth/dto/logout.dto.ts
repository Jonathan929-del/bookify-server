// Imports
import { IsNotEmpty, IsString } from 'class-validator';


// Dto
export class LogoutDto {
    @IsNotEmpty({ message: 'userId is required' })
    @IsString({ message: 'userId must be a string' })
    userId: string;
};