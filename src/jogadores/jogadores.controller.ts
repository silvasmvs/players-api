import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { JogadoresService } from './jogadores.service';
import { Jogador } from './interfaces/jogador.interface';

@Controller('api/v1/jogadores')
export class JogadoresController {

    constructor(private readonly jogadoresService: JogadoresService){}

    @Post()
    async criarAtualizarJogador(
        @Body() criarJogadorDto: CriarJogadorDto
    ) {
        await this.jogadoresService.criaAtualizarJogador(criarJogadorDto);
    }

    @Get()
    async consultarJogadores(
        @Query('email') email:string
    ): Promise<Jogador[] | Jogador> {
        if(email) {
            return this.jogadoresService.consultarJogadorPorEmail(email);
        }

        return this.jogadoresService.consultarTodosJogadores();
    }

    @Delete() 
    async deletarJogador(
        @Query('email') email:string
    ): Promise<void> {
        await this.jogadoresService.deletarJogador(email);
    }
}
