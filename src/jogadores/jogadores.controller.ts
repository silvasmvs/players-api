import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { JogadoresService } from './jogadores.service';
import { Jogador } from './interfaces/jogador.interface';
import { JogadoresValidationParametersPipe } from './pipes/jogadores-validation-parameters.pipe';
import { AtualizarJogadorDto } from './dtos/atualizar-jogador.dto';

@Controller('api/v1/jogadores')
export class JogadoresController {

    constructor(private readonly jogadoresService: JogadoresService){}

    @Post()
    @UsePipes(ValidationPipe)
    async criarJogador(
        @Body() criarJogadorDto: CriarJogadorDto
    ) {
        return await this.jogadoresService.criarJogador(criarJogadorDto);
    }

    @Put('/:id')
    @UsePipes(ValidationPipe)
    async atualizarJogador(
        @Param('id', JogadoresValidationParametersPipe) id:string,
        @Body() atualizarJogadorDto: AtualizarJogadorDto,
    ): Promise<void> {
        await this.jogadoresService.atualizarJogador(id, atualizarJogadorDto);
    }


    @Get()
    async consultarJogadores(): Promise<Jogador[]> {
        return this.jogadoresService.consultarTodosJogadores();
    }

    @Get('/:id')
    async consultarJogadorPeloId(
        @Param('id', JogadoresValidationParametersPipe) id:string
    ): Promise<Jogador[] | Jogador> {
        return this.jogadoresService.consultarJogadorPeloId(id);
    }

    @Delete('/:_id') 
    async deletarJogador(
        @Param('_id', JogadoresValidationParametersPipe) _id:string
    ): Promise<void> {
        await this.jogadoresService.deletarJogador(_id);
    }
}
