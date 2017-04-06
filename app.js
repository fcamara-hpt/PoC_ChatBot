	var express = require('express');
	var request = require('request');
	var bodyParser = require('body-parser');
	var watson = require('watson-developer-cloud');
	var moment = require('moment');
	var app = express();
	var contexid = "";
	moment.locale('pt-BR');

	app.set('port', (process.env.PORT || 3000));
	app.use(express.static(__dirname + '/public'));
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

	var conversation_id = "";
	var w_conversation = watson.conversation({
	    url: 'https://gateway.watsonplatform.net/conversation/api',
	    username: process.env.CONVERSATION_USERNAME || '<USER>', //Altera <USER> Watson 
	    password: process.env.CONVERSATION_PASSWORD || '<PASSWORD>', //Alterar <PASSWORD> Watson
	    version: 'v1',
	    version_date: '2016-07-11'
	});
	var workspace = process.env.WORKSPACE_ID || '<WORKSPACE_ID>'; //Alterar <WORKSPACE_ID> Conversation

	app.get('/', function (req, res) {
		res.render('pages/index');
		res.send('Chatbot Watson for Messenger.');
	});

	//Para o chatbot se tornar público será necessario criar uma página de polica de privacidade e inseri-la no developers facebook(Abaixo um exemplo)
	/*app.get('/politica', function (req, res) {
		res.send('<h2>Política de privacidade para <a href=\'http://chatbot-watson-fc.mybluemix.net/\'>Chatbot Watson FC</a></h2><p>Todas as suas informações pessoais recolhidas, serão usadas para o ajudar a tornar a sua visita no nosso site o mais produtiva e agradável possível.</p><p>A garantia da confidencialidade dos dados pessoais dos utilizadores do nosso site é importante para o Chatbot Watson FC.</p><p>Todas as informações pessoais relativas a membros, assinantes, clientes ou visitantes que usem o Chatbot Watson FC serão tratadas em concordância com a Lei da Proteção de Dados Pessoais de 26 de outubro de 1998 (Lei n.º 67/98).</p><p>A informação pessoal recolhida pode incluir o seu nome, e-mail, número de telefone e/ou telemóvel, morada, data de nascimento e/ou outros.</p><p>O uso do Chatbot Watson FC pressupõe a aceitação deste Acordo de privacidade. A equipa do Chatbot Watson FC reserva-se ao direito de alterar este acordo sem aviso prévio. Deste modo, recomendamos que consulte a nossa política de privacidade com regularidade de forma a estar sempre atualizado.</p><h2>Os anúncios</h2><p>Tal como outros websites, coletamos e utilizamos informação contida nos anúncios. A informação contida nos anúncios, inclui o seu endereço IP (Internet Protocol), o seu ISP (Internet Service Provider, como o Sapo, Clix, ou outro), o browser que utilizou ao visitar o nosso website (como o Internet Explorer ou o Firefox), o tempo da sua visita e que páginas visitou dentro do nosso website.</p><h2>Ligações a Sites de terceiros</h2><p>O Chatbot Watson FC possui ligações para outros sites, os quais, a nosso ver, podem conter informações / ferramentas úteis para os nossos visitantes. A nossa política de privacidade não é aplicada a sites de terceiros, pelo que, caso visite outro site a partir do nosso deverá ler a politica de privacidade do mesmo.</p><p>Não nos responsabilizamos pela política de privacidade ou conteúdo presente nesses mesmos sites.</p>');
	});*/

	app.listen(app.get('port'), function() {
	  console.log('Node app is running on port', app.get('port'));
	});

	app.get('/webhook/', function (req, res) {
	    if (req.query['hub.verify_token'] === '<SENHA_DE_VERIFICAÇÃO>' ) {    //Alterar <SENHA_DE_VERIFICAÇÃO> para usar no developers facebook
	        res.send(req.query['hub.challenge']);
	    }
	    res.send('Erro de validação no token.');
	});

	app.post('/webhook/', function (req, res) {
		var text = null;

	    messaging_events = req.body.entry[0].messaging;
		for (i = 0; i < messaging_events.length; i++) {
	        event = req.body.entry[0].messaging[i];
	        sender = event.sender.id;

	        if (event.message && event.message.text) {
				text = event.message.text;
			}else if (event.postback && !text) {
				text = event.postback.payload;
			}else{
				break;
			}

			var params = {
				input: text,
				context:contexid
			};

			var payload = {
				workspace_id: "<WORKSPACE_ID>"
			};

			if (params) {
				if (params.input) {
					params.input = params.input.replace("\n","");
					payload.input = { "text": params.input };
				}
				if (params.context) {
					payload.context = params.context;
				}
			}

			callWatson(payload, sender);
	    }
	    res.sendStatus(200);
	});

	function callWatson(payload, sender) {
		w_conversation.message(payload, function (err, convResults) {
			console.log(convResults);

			contexid = convResults.context;
			node = convResults.output.nodes_visited;

			if(convResults.context.data){
				data = convResults.context.data;
			} else {
				data = 'null';
				console.log(data);
			}

	        if (err) {
	            return responseToRequest.send("Erro.");
	        }

			if(convResults.context != null)
	    	   conversation_id = convResults.context.conversation_id;
	        if(convResults != null && convResults.output != null){
				var i = 0;
				if(node == 'Checar a Data'){
							sendMessageData(sender, data);
				} else {
					while(i < convResults.output.text.length){
							sendMessage(sender, convResults.output.text[i++], node, data);
					}
				}
			}

	    });
	}

	function sendMessageData(sender, data){

		var hoje = moment().format('YYYY[-]MM[-]DD');
		console.log("\nHoje: " + hoje + ", Data: " + data);

		if(hoje <= data && data != 'null'){
			var returnData = "dc correta";
		} else if(hoje > data){
			var returnData = "da anterior";
		} else {
			var returnData = "dv inexistente";
		}

		var params = {
			input: returnData,
			context:contexid
		};

		var payload = {
			workspace_id: "<WOKSPACE_ID>"
		};

		if (params) {
			if (params.input) {
				params.input = params.input.replace("\n","");
				payload.input = { "text": params.input };
			}
			if (params.context) {
				payload.context = params.context;
			}
		}

		callWatson(payload, sender);
	}

	function sendMessage(sender, text_, node, data_watson) {
		text_watson = text_.substring(0, 319);
		check_iata = text_.substring(0, 4);
		if(data_watson != 'null' && data_watson){
			var data = moment(data_watson).format('L');
		}
		iata = text_.substring(5,8);

		switch(text_watson){
			case 'inicio_mensagem': {
				messageData = {
			    "attachment": {
				    "type": "template",
				    "payload": {
						"template_type": "generic",
					    "elements": [{
					    	"title": "Olá, você quer viajar?",
								"image_url": "https://media.licdn.com/mpr/mpr/shrink_200_200/AAEAAQAAAAAAAAc2AAAAJGI2MTg2NzdiLTAwY2QtNGI3NS1hZTM0LTFhM2U3NDExMDY4Nw.png",
						    "buttons": [{
							    "type": "postback",
							    "title": "Sim",
							    "payload": "sim",
						    }, {
							    "type": "postback",
							    "title": "Não",
							    "payload": "não",
						    }],
					    }]
				    }
			    }
			    };

					sendRequest(messageData);
			    break;
			}

			case 'quer_viajar':{
				messageData = {
			    "attachment": {
				    "type": "template",
				    "payload": {
						"template_type": "generic",
					    "elements": [{
					    	"title": "Perfeito, qual é o seu destino?",
						    "buttons": [{
							    "type": "postback",
							    "title": "São Paulo",
							    "payload": "sao paulo",
						    }, {
							    "type": "postback",
							    "title": "Rio de Janeiro",
							    "payload": "rio de janeiro",
						    }, {
							    "type": "postback",
							    "title": "Outro",
							    "payload": "outro",
						    }],
					    }]
				    }
			    }

				};

				sendRequest(messageData);
			  break;
			}

			case 'quer_viajar2':{
				messageData = { text: "Para onde deseja ir?" };

				sendRequest(messageData);
			  break;
			}

			case 'nao_quer_viajar': {
				messageData = {
				    "attachment": {
					    "type": "template",
					    "payload": {
							"template_type": "generic",
						    "elements": [{
						    	"title": "Não quer? Tem certeza? Visualize essa oferta de viagem para o Rio de Janeiro: ",
									"subtitle": "R$ 130 + encargos (R$ 100)",
						    	"image_url": "http://www.folhavitoria.com.br/geral/blogs/folha-viagem/wp-content/uploads/2015/08/TALES.jpg",
							    "buttons": [{
							    "type": "web_url",
							    "url": "https://www.decolar.com/book/flights/12d09d23/checkout/4472f2a53c6742a1b516aa6247fe3767",
							    "title": "Compre aqui"
						    }],
							}, {
					    	"title": "Temos também para São Paulo:",
					    	"subtitle": "R$ 130 + encargos (R$ 100)",
					    	"image_url": "http://www.folhavitoria.com.br/geral/blogs/folha-viagem/wp-content/uploads/2015/08/TALES.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.decolar.com/book/flights/12d09d23/checkout/ab5ceddbd4a34251abd0556df7b1ff7c",
						    "title": "Compre aqui"
					    }],
					    }]
					    }
				    }
			    };

					sendRequest(messageData);
			    break;
			}

			case 'rio':{
				messageData = {
			    "attachment": {
				    "type": "template",
				    "payload": {
						"template_type": "generic",
					    "elements": [{
					    	"title": "Oferta em " + data + " para Rio de Janeiro:",
					    	"subtitle": "R$ 130 + encargos (R$ 100)",
					    	"image_url": "http://www.folhavitoria.com.br/geral/blogs/folha-viagem/wp-content/uploads/2015/08/TALES.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.decolar.com/shop/flights/results/oneway/sao/rio/" + data_watson + "/1/0/0",
						    "title": "Compre aqui"
					    }],
					    },
					    {
					    	"title": "Oferta Azul em " + data + " para Rio de Janeiro:",
					    	"subtitle": "R$ 162 + encargos (R$ 89)",
					    	"image_url": "http://cdn.panrotas.com.br/media-files-original/2015/11/24/azul2811144.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.decolar.com/shop/flights/results/oneway/sao/rio/" + data_watson + "/1/0/0",
						    "title": "Compre aqui"
					    }],
					    },
					     {
					    	"title": "Oferta Aviança em " + data + " para Rio de Janeiro:",
					    	"subtitle": "R$ 162 + encargos (R$ 100)",
					    	"image_url": "http://ww2.baguete.com.br/admin//cache/image/noticias/2016/03/1459435265_Avianca.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.decolar.com/shop/flights/results/oneway/sao/rio/" + data_watson + "/1/0/0",
						    "title": "Compre aqui"
					    }],
					    }]
				    }
			    }
		    };

				sendRequest(messageData);
				break;
			}

			case 'sao':{
				messageData = {
			    "attachment": {
				    "type": "template",
				    "payload": {
						"template_type": "generic",
					    "elements": [{
					    	"title": "Oferta TAM em " + data + " para São Paulo:",
					    	"subtitle": "R$ 130 + encargos (R$ 100)",
					    	"image_url": "http://www.folhavitoria.com.br/geral/blogs/folha-viagem/wp-content/uploads/2015/08/TALES.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.decolar.com/shop/flights/results/oneway/rio/sao/" + data_watson + "/1/0/0",
						    "title": "Compre aqui"
					    }],
					    },
					    {
					    	"title": "Oferta Azul em " + data + " para São Paulo:",
					    	"subtitle": "R$ 162 + encargos (R$ 89)",
					    	"image_url": "http://cdn.panrotas.com.br/media-files-original/2015/11/24/azul2811144.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.decolar.com/shop/flights/results/oneway/rio/sao/" + data_watson + "/1/0/0",
						    "title": "Compre aqui"
					    }],
					    },
					     {
					    	"title": "Oferta Aviança em " + data + " para São Paulo:",
					    	"subtitle": "R$ 162 + encargos (R$ 100)",
					    	"image_url": "http://ww2.baguete.com.br/admin//cache/image/noticias/2016/03/1459435265_Avianca.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.decolar.com/shop/flights/results/oneway/rio/sao/" + data_watson + "/1/0/0",
						    "title": "Compre aqui"
					    }],
					    }]
				    }
			    }
			}

				sendRequest(messageData);
				break;
			}
			case 'data': {
				messageData = { text: "Quando você deseja viajar? (Ex: 25/07/2017, verifique se é uma data futura.)"};

				sendRequest(messageData);
			  break;
			}
			case 'desconhecido': {
				messageData = { text: "Desculpe, não entendi o que quis dizer. Estamos te redirecionando para o início do atendimento."};

				sendRequest(messageData);
			  break;
			}
			default:
		}


		if(check_iata === "iata"){
			messageData = {
			    "attachment": {
				    "type": "template",
				    "payload": {
						"template_type": "generic",
					    "elements": [{
					    	"title": "Perfeito, veja essas passagens para " + node + " em " + data + ":",
					    	"image_url": "http://demasiadohumano.com/wp-content/uploads/2016/08/aviao-voando.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.decolar.com/shop/flights/results/oneway/sao/" + iata + "/" + data_watson + "/1/0/0",
						    "title": "Pesquisar Voos"
					    }],
					    }]
				    }
			    }
		    };
			sendRequest(messageData);
		}
	}

function sendRequest(messageData){
	request({
				url: 'https://graph.facebook.com/v2.6/me/messages',
				qs: { access_token: token },
				method: 'POST',
				json: {
						recipient: { id: sender },
						message: messageData,
				}
		}, function (error, response, body) {
				if (error) {
						console.log('Error sending message: ', error);
				} else if (response.body.error) {
						console.log('Error: ', response.body.error);
				}
		});
}

	var token = "<PAGE_ACCESS_TOKEN>"; //Alterar <PAGE_ACCESS_TOKEN> pelo token gerado no developers facebook
	var host = process.env.VCAP_APP_HOST || 'localhost';
	var port = process.env.VCAP_APP_PORT || 3000;
	app.listen(port, host);
