var express = require('express');
var request = require('request');
var router  = express.Router();

var wwDominio = 'http://w.blockchain.wgetdev.tech:3000/'

//TODO: Refatorar o Kafka em Serviço

/* --[ KAFKA ]-- */
var kafka = require('kafka-node')
var Producer = kafka.Producer
var client = new kafka.Client("stagihobd.hashtagsource.com:2181")
var producer = new Producer(client);

var topico = "atendimento-hospital";
var topicoOnline = false ;

// Configurando o Kafka
producer.on('ready', function () {
  console.log("Producer para VAGA está pronto, no tópico 'cross'");
  topicoOnline = true;
});

producer.on('error', function (err) {
  console.error("Não foi possível iniciar o Producer do Kafka"+err);
});

// enviar mensagem ao Kafka
function sendMessageKafka(topic, msg) {
  payloads = [ { topic: topic, messages: msg } ];

  if (topicoOnline) {
    producer.send(payloads, function (err, data) {
        console.log(data);
    });
  } else {
      console.error("desculpe, topico 'cross' não está pronto, falha ao enviar a mensagem ao Kafka.");
  }
}
/* --[ KAFKA - fim ]-- */

function retornarStatus(res, statusCode, infos, erro){
  if (statusCode == 200 || statusCode == 201)
    res.status(200).send({ result: "Operacao Efetuada com Sucesso " + JSON.stringify(infos)});

  if (statusCode == 500)
      res.status(500).send({ result: "Erro ao tentar realizar a Operacao\n:" +  + JSON.stringify(infos) + " \n: " + erro});
}

function RealizarProntuarioAsset(req, res){
    var dados = {
        "$class": "stagihobd.atendimento.ProntuarioAsset",
        "atendimentoID": req.body.atendimentoID,
        "dono": "resource:stagihobd.atendimento.MedicoParticipant#"+req.body.crm,
        "status": req.body.status
    };
    
    var options = {
        uri   : wwDominio+'/api/stagihobd.atendimento.ProntuarioAsset',
        method: 'POST',
        json  :  dados
    };

    request(options, (error, response, body) => {
        if (!error && response.statusCode == 200){
            sendMessageKafka(topico, JSON.stringify(options));
            RealizarProntuarioTransaction(req, res);
        }
        retornarStatus(res, response.statusCode, options, error);
    });
}

function RealizarProntuarioTransaction(req, res){
    var dados = {
        "$class": "stagihobd.atendimento.RegistrarProntuarioTransaction",
        "asset": "resource:stagihobd.atendimento.ProntuarioAsset#"+req.body.prontuarioID,
        "prontuarioID": req.body.prontuarioID,
        "atendimentoID": req.body.atendimentoID,
        "autorizacaoID": req.body.autorizacaoID,
        "pacienteID": req.body.pacienteID,
        "status": req.body.status,
        "registroClinico": req.body.registroClinico,
        "dadosColetados": req.body.dadosColetados,
        "avaliacao": req.body.avaliacao,
        "plano": req.body.plano,
        "dataAtendimento": req.body.dataAtendimento
    };
    
    var options = {
        uri   : wwDominio+'/api/stagihobd.atendimento.RegistrarProntuarioTransaction',
        method: 'POST',
        json  :  dados
    };
    
    request(options, (error, response, body) => {
        if (!error && response.statusCode == 200)
          sendMessageKafka(topico, body.transactionId);
        retornarStatus(res, response.statusCode, options, error);
    });    
}

// API para realizar o cadastro do prontuário (Asset + Transaction)
router.post('/atendimento-prontuario', function(req, res) {
    RealizarProntuarioAsset(req, res)
});

// API para buscar o prontuário
router.get('/atendimento-prontuario/:id', function(req, res) {
    var url = wwDominio+'/api/stagihobd.atendimento.AtendimentoAsset/'+req.params.id
    request.get(url, (error, response, body) => {
        retornarStatus(res, response.statusCode, url, error);
      });
  });  

  module.exports = router;