	var express = require('express');
	var request = require('request');
	var bodyParser = require('body-parser');
	var watson = require('watson-developer-cloud');
	var app = express();
	var contexid = "";

	app.set('port', (process.env.PORT || 3000));
	app.use(express.static(__dirname + '/public'));
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

	var conversation_id = "";
	var w_conversation = watson.conversation({
	    url: 'https://gateway.watsonplatform.net/conversation/api',
	    username: process.env.CONVERSATION_USERNAME || '273741a6-a02c-41c1-8a05-6b4cc1f5d1cc',
	    password: process.env.CONVERSATION_PASSWORD || 'B4bAMAxcYVuu',
	    version: 'v1',
	    version_date: '2016-07-11'
	});
	var workspace = process.env.WORKSPACE_ID || 'workspaceId';

	app.get('/', function (req, res) {
		res.render('pages/index');
		res.send('Chatbot Watson for Messenger.');
	});

	app.get('/politica', function (req, res) {
		res.send('<h2>Política de privacidade para <a href=\'http://chatbot-watson-fc.mybluemix.net/\'>Chatbot Watson FC</a></h2><p>Todas as suas informações pessoais recolhidas, serão usadas para o ajudar a tornar a sua visita no nosso site o mais produtiva e agradável possível.</p><p>A garantia da confidencialidade dos dados pessoais dos utilizadores do nosso site é importante para o Chatbot Watson FC.</p><p>Todas as informações pessoais relativas a membros, assinantes, clientes ou visitantes que usem o Chatbot Watson FC serão tratadas em concordância com a Lei da Proteção de Dados Pessoais de 26 de outubro de 1998 (Lei n.º 67/98).</p><p>A informação pessoal recolhida pode incluir o seu nome, e-mail, número de telefone e/ou telemóvel, morada, data de nascimento e/ou outros.</p><p>O uso do Chatbot Watson FC pressupõe a aceitação deste Acordo de privacidade. A equipa do Chatbot Watson FC reserva-se ao direito de alterar este acordo sem aviso prévio. Deste modo, recomendamos que consulte a nossa política de privacidade com regularidade de forma a estar sempre atualizado.</p><h2>Os anúncios</h2><p>Tal como outros websites, coletamos e utilizamos informação contida nos anúncios. A informação contida nos anúncios, inclui o seu endereço IP (Internet Protocol), o seu ISP (Internet Service Provider, como o Sapo, Clix, ou outro), o browser que utilizou ao visitar o nosso website (como o Internet Explorer ou o Firefox), o tempo da sua visita e que páginas visitou dentro do nosso website.</p><h2>Ligações a Sites de terceiros</h2><p>O Chatbot Watson FC possui ligações para outros sites, os quais, a nosso ver, podem conter informações / ferramentas úteis para os nossos visitantes. A nossa política de privacidade não é aplicada a sites de terceiros, pelo que, caso visite outro site a partir do nosso deverá ler a politica de privacidade do mesmo.</p><p>Não nos responsabilizamos pela política de privacidade ou conteúdo presente nesses mesmos sites.</p>');
	});

	app.listen(app.get('port'), function() {
	  console.log('Node app is running on port', app.get('port'));
	});

	app.get('/webhook/', function (req, res) {
	    if (req.query['hub.verify_token'] === 'EAACtS5HesysBANzGylpaKEZCiT4xhPqcjRjDHpl2Ahffr7FTdHCD7BvUl25narZAaC3Lq0iTkZBr79D9AZBAlgjxOjUqk7mu6UQxjgKytMnZAFl0nTZCDx3WGpBLyBa58nfiGf9hD3wi5Q3F5abKd0D5nq6fn67phSx1F5BZArnkgZDZD') {
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
				// context: {"conversation_id": conversation_id}
				context:contexid
			};

			console.log("\nSender: " + sender + ", text: " + text + ", contexid: " + params.context + "\n");

			var payload = {
				workspace_id: "d4703e1c-464c-4a13-a458-7e401f80e0d2"
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

			if(convResults.context.data || convResults.context.data == 'null'){
				data = convResults.context.data;
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
							sendMessage(sender, convResults.output.text[i++], node);
					}
				}
			}

	    });
	}

	function sendMessageData(sender, data){
		var hoje = new Date();
		/* var dd = hoje.getDate();
		var mm = hoje.getMonth()+1;
		var yyyy = hoje.getFullYear();

		if(dd<10){
		    dd='0'+dd;
		}
		if(mm<10){
		    mm='0'+mm;
		}
		var hoje = yyyy + '-' + mm + '-' + dd; */

		console.log("Hoje: " + hoje + ", Data: " + data);

		if(hoje.toString() <= data){
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
			workspace_id: "d4703e1c-464c-4a13-a458-7e401f80e0d2"
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

	function sendMessage(sender, text_, node) {
		text_ = text_.substring(0, 319);
		text2 = text_.substring(0, 4);

		console.log("\nText_: " + text_ + " + Tamanho de text_: " + text_.length + " + Sender: " + sender);

		switch(text_){
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
					    	"title": "Oferta TAM Rio de Janeiro:",
					    	"subtitle": "R$ 130 + encargos (R$ 100)",
					    	"image_url": "http://www.folhavitoria.com.br/geral/blogs/folha-viagem/wp-content/uploads/2015/08/TALES.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.decolar.com/book/flights/12d09d23/checkout/4472f2a53c6742a1b516aa6247fe3767",
						    "title": "Compre aqui"
					    }],
					    },
					    {
					    	"title": "Oferta Azul Rio de Janeiro:",
					    	"subtitle": "R$ 162 + encargos (R$ 89)",
					    	"image_url": "http://cdn.panrotas.com.br/media-files-original/2015/11/24/azul2811144.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.decolar.com/book/flights/12d09d23/checkout/dd1276c9f8ed43faab0b30dc7feb2695",
						    "title": "Compre aqui"
					    }],
					    },
					     {
					    	"title": "Oferta Aviança Rio de Janeiro:",
					    	"subtitle": "R$ 162 + encargos (R$ 100)",
					    	"image_url": "http://ww2.baguete.com.br/admin//cache/image/noticias/2016/03/1459435265_Avianca.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.decolar.com/book/flights/12d09d23/checkout/ea750bd8190140eaa3621db91368c3fa",
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
					    	"title": "Oferta TAM São Paulo:",
					    	"subtitle": "R$ 130 + encargos (R$ 100)",
					    	"image_url": "http://www.folhavitoria.com.br/geral/blogs/folha-viagem/wp-content/uploads/2015/08/TALES.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.decolar.com/book/flights/12d09d23/checkout/ab5ceddbd4a34251abd0556df7b1ff7c",
						    "title": "Compre aqui"
					    }],
					    },
					    {
					    	"title": "Oferta Azul São Paulo:",
					    	"subtitle": "R$ 162 + encargos (R$ 89)",
					    	"image_url": "http://cdn.panrotas.com.br/media-files-original/2015/11/24/azul2811144.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.decolar.com/book/flights/12d09d23/checkout/fbded4e3859048f58b3362b982450c22",
						    "title": "Compre aqui"
					    }],
					    },
					     {
					    	"title": "Oferta Aviança São Paulo:",
					    	"subtitle": "R$ 162 + encargos (R$ 100)",
					    	"image_url": "http://ww2.baguete.com.br/admin//cache/image/noticias/2016/03/1459435265_Avianca.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": "https://www.decolar.com/book/flights/12d09d23/checkout/096b0fc5a72c485598a8ffa2add1822c",
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
				messageData = { text: "Quando deseja viajar? (Ex: 25/07/2017)"};

				sendRequest(messageData);
			  break;
			}
			default:
		}



		if(text2 === "http"){
			messageData = {
			    "attachment": {
				    "type": "template",
				    "payload": {
						"template_type": "generic",
					    "elements": [{
					    	"title": "Perfeito, veja essas passagens para " + node + ":",
					    	"image_url": "http://demasiadohumano.com/wp-content/uploads/2016/08/aviao-voando.jpg",
						    "buttons": [{
						    "type": "web_url",
						    "url": text_,
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

	var token = "EAACtS5HesysBANzGylpaKEZCiT4xhPqcjRjDHpl2Ahffr7FTdHCD7BvUl25narZAaC3Lq0iTkZBr79D9AZBAlgjxOjUqk7mu6UQxjgKytMnZAFl0nTZCDx3WGpBLyBa58nfiGf9hD3wi5Q3F5abKd0D5nq6fn67phSx1F5BZArnkgZDZD";
	var host = process.env.VCAP_APP_HOST || 'localhost';
	var port = process.env.VCAP_APP_PORT || 3000;
	app.listen(port, host);
