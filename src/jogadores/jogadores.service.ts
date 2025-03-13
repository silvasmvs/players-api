import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { Jogador } from './interfaces/jogador.interface';

import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class JogadoresService {

    private jogadores: Jogador[] = [];

    private readonly logger = new Logger(JogadoresService.name);

    async criaAtualizarJogador(criarJogadorDto: CriarJogadorDto): Promise<void> {
        const { email } = criarJogadorDto;

        const jogadorEncontrado = await this.jogadores.find(jogador => jogador.email === email)

        if(jogadorEncontrado) {
            await this.atualizar(jogadorEncontrado, criarJogadorDto);
        } else {
            await this.criar(criarJogadorDto);
        }
    }

    async deletarJogador(email: string): Promise<void> {
        const jogadorEncontrado = this.jogadores.find(jogador => jogador.email === email);

        if(jogadorEncontrado) {
            this.jogadores = this.jogadores.filter(jogador => jogador.email === email);
        }
    }

    async consultarTodosJogadores(): Promise<Jogador[]> {
        return this.consultarTodos();
    }

    async consultarJogadorPorEmail(email: string): Promise<Jogador> {
        return this.consultarJogador(email);
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

    private atualizar(jogadorEncontrado: Jogador, criarJogadorDto: CriarJogadorDto): void {
        const  { nome } = criarJogadorDto;

        jogadorEncontrado.nome = nome;
    }
    
    private async consultarTodos(): Promise<Jogador[]> {
        return this.jogadores;
    }

    private async consultarJogador(email: string): Promise<Jogador> {
        const jogadorEncontrado = this.jogadores.find(jogador => jogador.email === email);

        if(!jogadorEncontrado) {
            throw new NotFoundException(`Jogador com email ${email} não encontrado`);
        }

        return jogadorEncontrado;
    }

}
