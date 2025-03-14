import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Categoria } from './interfaces/categoria.interface';
import { Model } from 'mongoose';
import { CriarCategoriaDto } from './dtos/criar-categoria.dto';
import { AtualizarCategoriaDto } from './dtos/atualizar-categoria.dto';
import { JogadoresService } from 'src/jogadores/jogadores.service';

@Injectable()
export class CategoriasService {
    constructor(
        @InjectModel('Categoria') private readonly categoriaModel: Model<Categoria>,
        private readonly jogadoresService: JogadoresService
    ) {}

    async criar(criarCategoriaDto: CriarCategoriaDto): Promise<Categoria> {
        const { categoria } = criarCategoriaDto;

        const categoriaEncontrada = await this.categoriaModel.findOne({ categoria }).exec();

        if(categoriaEncontrada) {
            throw new BadRequestException(`Categoria ${categoria} já cadastrada`);
        }

        const categoriaCriada = new this.categoriaModel(criarCategoriaDto);
        return await categoriaCriada.save();
    }

    async consultarTodos(): Promise<Categoria[]> {
        return this.categoriaModel.find().populate("jogadores").exec();
    }
    
    async consultarPeloId(_id: string): Promise<Categoria> {
        const categoriaEncontrada =  await this.categoriaModel.findOne({ _id }).exec();

        if(!categoriaEncontrada) {
            throw new NotFoundException(`Categoria com id ${_id} não encontrada`);
        }

        return categoriaEncontrada;
    }

    async atualizar(_id: string, atualizarCategoriaDto: AtualizarCategoriaDto): Promise<void> {
        const categoriaEncontrada = await this.categoriaModel.findOne({ _id }).exec();

        if(!categoriaEncontrada) {
            throw new NotFoundException(`Categoria com id ${_id} não encontrada`);
        }

        await this.categoriaModel.findOneAndUpdate({ _id }, { $set: atualizarCategoriaDto }).exec();
    }
    
    async deletar(_id: string): Promise<void> {
        const categoriaEncontrada =  await this.categoriaModel.findOne({ _id }).exec();

        if(!categoriaEncontrada) {
            throw new NotFoundException(`Categoria com id ${_id} não encontrada`);
        }
        
        await this.categoriaModel.deleteOne({ _id });
    }

    async atribuirCategoriaJogador(params: string[]): Promise<void> {
        const categoriaId = params['categoria'];
        const jogadorId = params['jogador'];

        const categoriaEncontrada = await this.categoriaModel.findOne({ _id: categoriaId }).exec();
        const jogadorJaCadastradoCategoria = await this.categoriaModel.find({ _id: categoriaId }).where('jogadores').in(jogadorId).exec();
        
        await this.jogadoresService.consultarJogadorPeloId(jogadorId);

        if(!categoriaEncontrada) {
            throw new BadRequestException(`Categoria ${categoriaId} não cadastrada!`);
        }

        if(jogadorJaCadastradoCategoria.length > 0) {
            throw new BadRequestException(`Jogador ${jogadorId} já cadastrado na categoria ${categoriaId}`);
        }

        categoriaEncontrada.jogadores.push(jogadorId);
        await this.categoriaModel.findOneAndUpdate({ _id: categoriaId }, {$set: categoriaEncontrada}).exec();
    }
}
