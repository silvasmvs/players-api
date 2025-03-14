import { ArrayMinSize, IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Evento } from '../interfaces/categoria.interface';

export class CriarCategoriaDto {
    @IsString()
    @IsNotEmpty()
    readonly categoria: string;
    
    @IsString()
    @IsNotEmpty()
    descricao: string;

    @IsArray()
    @ArrayMinSize(1)
    eventos: Evento[]
}