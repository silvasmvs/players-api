import * as mongoose from 'mongoose';

export const JogadorSchema = new mongoose.Schema({
    telefoneCelular: { type: String, unique: true },
    email: { type: String, unique: true },
    nome: String,
    ranking: String,
    posicaoranking: Number,
    urlFotoJogador: String
}, { timestamps: true, collection: 'jogadores' })