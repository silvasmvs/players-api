import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { Jogador } from './interfaces/jogador.interface';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class JogadoresService {

    constructor(@InjectModel('Jogador') private readonly jogadorModel: Model<Jogador>) {}

    private readonly logger = new Logger(JogadoresService.name);

    async criaAtualizarJogador(criarJogadorDto: CriarJogadorDto): Promise<void> {
        const { email } = criarJogadorDto;

        const jogadorEncontrado = await this.jogadorModel.findOne({ email }).exec();

        if(jogadorEncontrado) {
            await this.atualizar(criarJogadorDto);
        } else {
            await this.criar(criarJogadorDto);
        }
    }

    async deletarJogador(email: string): Promise<void> {
        await this.jogadorModel.findOneAndDelete({ email });
    }

    async consultarTodosJogadores(): Promise<Jogador[]> {
        return this.jogadorModel.find().exec();
    }

    async consultarJogadorPorEmail(email: string): Promise<Jogador> {
        const jogadorEncontrado =  await this.jogadorModel.findOne({ email }).exec();

        if(!jogadorEncontrado) {
            throw new NotFoundException(`Jogador com email ${email} não encontrado`);
        }

        return jogadorEncontrado;
    }

    private async criar(criarJogadorDto: CriarJogadorDto): Promise<Jogador> {
        const jogadorCriado = new this.jogadorModel(criarJogadorDto);

        return await jogadorCriado.save();
    }

    private async atualizar(criarJogadorDto: CriarJogadorDto): Promise<Jogador | null> {
        return await this.jogadorModel.findOneAndUpdate({ email: criarJogadorDto.email }, { $set: criarJogadorDto }).exec();
    }
}
