import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CriarCategoriaDto } from './dtos/criar-categoria.dto';
import { Categoria } from './interfaces/categoria.interface';
import { CategoriasService } from './categorias.service';
import { CategoriasValidationParametersPipe } from './pipes/categorias-validation-parameters.pipe';
import { AtualizarCategoriaDto } from './dtos/atualizar-categoria.dto';

@Controller('api/v1/categorias')
export class CategoriasController {
    constructor(private readonly categoriaService: CategoriasService) {}

    @Post()
    @UsePipes(ValidationPipe)
    async criarCategoria(
        @Body() criarCategoriaDto: CriarCategoriaDto
    ): Promise<Categoria> {
        return await this.categoriaService.criar(criarCategoriaDto);
    }

    @Put('/:id')
    @UsePipes(ValidationPipe)
    async atualizarCategoria(
        @Param('id', CategoriasValidationParametersPipe) id:string,
        @Body() atualizarCategoriaDto: AtualizarCategoriaDto,
    ): Promise<void> {
        await this.categoriaService.atualizar(id, atualizarCategoriaDto);
    }
    
    
    @Get()
    async consultarCategorias(): Promise<Categoria[]> {
        return this.categoriaService.consultarTodos();
    }

    @Get('/:id')
    async consultarCategoriaPeloId(
        @Param('id', CategoriasValidationParametersPipe) id:string
    ): Promise<Categoria> {
        return this.categoriaService.consultarPeloId(id);
    }

    @Delete('/:_id') 
    async deletarJogador(
        @Param('_id', CategoriasValidationParametersPipe) _id:string
    ): Promise<void> {
        await this.categoriaService.deletar(_id);
    }

    @Post('/:categoria/jogadores/:jogador')
    async atribuirCategoriaJogador(
        @Param() params: string[]
    ): Promise<void> {
        return await this.categoriaService.atribuirCategoriaJogador(params);
    }
}
