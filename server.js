require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

const PORTA = process.env.PORTA || process.env.PORT || 3000;
const dbUser = process.env.MONGODB_USERNAME;
const dbPassword = process.env.MONGODB_PASSWORD;
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
    .then(() =>console.log("Banco de Dados Conrctado."))
    .catch((erro)=> console.log("Erro critico na Conexão:", erro));

    const agendamentoSchema = new mongoose.Schema({
        jogador: { type: String, required: true },
        quantidadeDePessoas: { type: Number, required: true },
        bolaAlugada: { type: Boolean, required: false },
        quadra: { type: Number, required: true },
        dataAluguel: { type: Date },
        horario: { type: Date, default: Date.now },
    });
    const Agendamento = mongoose.model('Agendamento', agendamentoSchema);
    //CREATE : CRUDE -> C
    app.post('/agendamentos', async (req, res) => {
        try {
            const DaodsRecebidos = req.body;
            const agendamento = new Agendamento({
                jogador: DaodsRecebidos.jogador,
                quantidadeDePessoas: DaodsRecebidos.quantidadeDePessoas,
                bolaAlugada: DaodsRecebidos.bolaAlugada,
                quadra: DaodsRecebidos.quadra,
                dataAluguel: DaodsRecebidos.dataAluguel,
                horario: DaodsRecebidos.horario
            });
            await agendamento.save();
            res.status(201).json(agendamento);
        }catch (error) {
            console.error("Erro ao agendar:", error.message);
            res.status(500).json({ error: 'Erro ao gravar BD' });
        
        }
    });
    //read -> CRUD -> R
    app.get('/agendamentos', async (req, res) => {
        try {
            const listaDeAgendamentos = await Agendamento.find();
            res.status(200).json(listaDeAgendamentos);
        } catch (erro) {
            res.status(500).json({ error: "Erro ao buscar dados" });
        }
    })
    app.get('/agendamentos/:id', async (req, res) => {
        try{
            const agendamento = await Agendamento.findById(req.params.id);
            if (!agendamento) return res.status(404).json({ error: "reserva não encontrada" });
            res.status(200).json(agendamento);
        } catch (erro) {
            res.status(500).json({ error: "Erro ao buscar reserva" });
        }
    })
    //Update -> CRUD -> U
    app.put('/agendamentos/:id', async (req, res) => {
        try {
            const agendamentoAtualizado = await Agendamento.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators:true }
            );
            if (!agendamentoAtualizado) return res.status(404).json({ error: "reserva não encontrada" });
            res.status(200).json({ message: "reserva atualizada com sucesso", agendamentoAtualizado });
        } catch (erro) {
            res.status(500).json({ erro: "Erro ao atualizar reserva" });
        }
    });

    //Delete -> CRUD -> D
    app.delete('/agendamentos/:id', async (req, res) => {
        try {
            const idParaDeletar = req.params.id;
            const quadraDeletada = await Agendamento.findByIdAndDelete(idParaDeletar);
            if (!quadraDeletada) return res.status(404).json({ error: "reserva não encontrada" });
            res.status(200).json({ message: "reserva deletada com sucesso" });
        } catch (error) {
            res.status(500).json({ error: "Erro ao deletar reserva" });
        }
    });
    app.post('/agendar', (req, res) => {
        res.redirect(307, '/agendamentos');
    });
    app.listen(PORTA, () => {
        console.log(`Arena de Quadra Liberadas na porta :${PORTA}`);
    })
