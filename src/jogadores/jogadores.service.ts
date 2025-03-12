import { Injectable, Logger } from '@nestjs/common';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { Jogador } from './interfaces/jogador.interface';

import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class JogadoresService {

    private jogadores: Jogador[] = [];

    private readonly logger = new Logger(JogadoresService.name);

    async criaAtualizarJogador(criarJogadorDto: CriarJogadorDto): Promise<void> {
        await this.criar(criarJogadorDto);
    }

    private criar(criarJogadorDto: CriarJogadorDto): void {
        const  { nome, telefoneCelular, email } = criarJogadorDto;

        const jogador: Jogador = {
            _id: uuidv4(),
            nome,
            telefoneCelular,
            email,
            ranking: 'A',
            posicaoranking: 1,
            urlFotoJogador: 'www.google.com.br/foto123.jpg'
        };

        this.logger.log(`jogador: ${JSON.stringify(jogador)}`);
        this.jogadores.push(jogador);
    } 

}
