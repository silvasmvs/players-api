import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Desafio, Partida } from './interfaces/desafio.interface';
import { Model } from 'mongoose';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
import { AtribuirDesafioPartidaDto } from './dtos/atribuir-desafio-partida.dto';
import { DesafioStatus } from './interfaces/desafio-status.enum';
import { CategoriasService } from 'src/categorias/categorias.service';

@Injectable()
export class DesafiosService {
    constructor(
        @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
        @InjectModel('Partida') private readonly partidaModel: Model<Partida>,
        private readonly jogadoresService: JogadoresService,
        private readonly categoriasService: CategoriasService) {}

        private readonly logger = new Logger(DesafiosService.name)

    async criar(criarDesafioDto: CriarDesafioDto): Promise<Desafio> {
        const jogadores = await this.jogadoresService.consultarTodosJogadores();

        criarDesafioDto.jogadores.map(jogadorDto => {
            
            const jogadorFilter = jogadores.filter( jogador => jogador._id == jogadorDto._id )

            if (jogadorFilter.length == 0) {
                throw new BadRequestException(`O id ${jogadorDto._id} não é um jogador!`)
            }
        })
          
        const solicitanteEhJogadorDaPartida = await criarDesafioDto.jogadores.filter(jogador => jogador._id == criarDesafioDto.solicitante)

        this.logger.log(`solicitanteEhJogadorDaPartida: ${solicitanteEhJogadorDaPartida}`)

        if(solicitanteEhJogadorDaPartida.length == 0) {
            throw new BadRequestException(`O solicitante deve ser um jogador da partida!`)
        }

        const categoriaDoJogador = await this.categoriasService.consultarCategoriaDoJogador(criarDesafioDto.solicitante)

        /*
        Para prosseguir o solicitante deve fazer parte de uma categoria
        */
        if (!categoriaDoJogador) {
            throw new BadRequestException(`O solicitante precisa estar registrado em uma categoria!`)
        }

        const desafioCriado = new this.desafioModel(criarDesafioDto)
        desafioCriado.categoria = categoriaDoJogador.categoria
        desafioCriado.dataHoraSolicitacao = new Date()
        
        desafioCriado.status = DesafioStatus.PENDENTE
        this.logger.log(`desafioCriado: ${JSON.stringify(desafioCriado)}`)
        return await desafioCriado.save()

    }

    async consultarTodos(): Promise<Array<Desafio>> {
        return await this.desafioModel.find({ status : { $nin: ["CANCELADO"] }})
        .populate("solicitante")
        .populate("jogadores")
        .populate("partida")
        .exec()
    }

    async consultarDesafiosDeUmJogador(_id: any): Promise<Array<Desafio>> {

       const jogadores = await this.jogadoresService.consultarTodosJogadores()

        const jogadorFilter = jogadores.filter( jogador => jogador._id == _id )

        if (jogadorFilter.length == 0) {
            throw new BadRequestException(`O id ${_id} não é um jogador!`)
        }

        return await this.desafioModel.find({ status : { $nin: ["CANCELADO"] }})
        .where('jogadores')
        .in(_id)
        .populate("solicitante")
        .populate("jogadores")
        .populate("partida")
        .exec()

    }

    async atualizar(_id: string, atualizarDesafioDto: AtualizarDesafioDto): Promise<void> {
   
        const desafioEncontrado = await this.desafioModel.findById(_id).exec()

        if (!desafioEncontrado) {
            throw new NotFoundException(`Desafio ${_id} não cadastrado!`)
        }

        if (atualizarDesafioDto.status){
           desafioEncontrado.dataHoraResposta = new Date()         
        }
        desafioEncontrado.status = atualizarDesafioDto.status
        desafioEncontrado.dataHoraDesafio = atualizarDesafioDto.dataHoraDesafio

        await this.desafioModel.findOneAndUpdate({_id},{$set: desafioEncontrado}).exec()
        
    }

    async atribuirDesafioPartida(_id: string, atribuirDesafioPartidaDto: AtribuirDesafioPartidaDto ): Promise<void> {

        const desafioEncontrado = await this.desafioModel.findById(_id).exec();
        
        if (!desafioEncontrado) {
            throw new BadRequestException(`Desafio ${_id} não cadastrado!`)
        }

       const jogadorFilter = desafioEncontrado.jogadores.filter( jogador => jogador._id == atribuirDesafioPartidaDto.def )

        this.logger.log(`desafioEncontrado: ${desafioEncontrado}`)
        this.logger.log(`jogadorFilter: ${jogadorFilter}`)

       if (jogadorFilter.length == 0) {
           throw new BadRequestException(`O jogador vencedor não faz parte do desafio!`);
       }

       const partidaCriada = new this.partidaModel(atribuirDesafioPartidaDto);

       partidaCriada.categoria = desafioEncontrado.categoria;

       partidaCriada.jogadores = desafioEncontrado.jogadores;

       const resultado = await partidaCriada.save();
       
        desafioEncontrado.status = DesafioStatus.REALIZADO;

        desafioEncontrado.partida.id = resultado._id;

        try {
        await this.desafioModel.findOneAndUpdate({_id},{$set: desafioEncontrado}).exec() 
        } catch (error) {
            /*
            Se a atualização do desafio falhar excluímos a partida 
            gravada anteriormente
            */
           await this.partidaModel.deleteOne({_id: resultado._id}).exec();
           throw new InternalServerErrorException()
        }
    }

    async deletar(_id: string): Promise<void> {

        const desafioEncontrado = await this.desafioModel.findById(_id).exec()

        if (!desafioEncontrado) {
            throw new BadRequestException(`Desafio ${_id} não cadastrado!`)
        }
        
       desafioEncontrado.status = DesafioStatus.CANCELADO

       await this.desafioModel.findOneAndUpdate({_id},{$set: desafioEncontrado}).exec() 

    }
}
