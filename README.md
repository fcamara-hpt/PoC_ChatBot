# PoC_ChatBot 
## Introdução
Definitivamente 2016 é um ano marcante para os Chatbots. Foi o ano em que grandes empresas (como Facebook, Microsoft, Google e até mesmo
a Apple) decidiram abrir as suas plataformas para que milhares de desenvolvedores / designers / startups / empresas criassem chatbots.
Os chatbots nada mais são do que conversas automatizadas que acontecem em tempo real entre o computador e o usuário de determinado site,
marca e etc. Ou seja, eles funcionam como assistentes virtuais que utilizam a inteligência artificial para dialogar com um interlocutor.

O Facebook Messenger é uma das plataformas de mensagens mais populares, com mais de 1 bilhão de usuários ativos mensais. Após alguns
meses de o Facebook ter aberto sua plataforma de bot para os desenvolvedores, mais de 23.000 desenvolvedores estavam construindo bots.
Até agora, eles lançaram mais de 18.000 bots. Bots do Facebook Messenger estão amplamente associados às páginas do Facebook, o que é
bastante onipresente entre as empresas.

Além dos aplicativos móveis de mensagens, existem muitos prestadores de serviços de mensagens. Aplicativos móveis integram seus serviços
para fornecer recursos de mensagens in-app que os usuários podem utilizar para se comunicarem com outros. Como esses serviços de
mensagens são orientados a API, é possível desenvolver bots para interagir diretamente com essas APIs e conversar com usuários do
aplicativo.

## Watson Conversation
A API Conversation foi a última a ser lançada no Bluemix, permite que você crie, teste e implante rapidamente um bot ou agente
virtual em dispositivos móveis, plataformas de mensagens como Facebook Messenger ou mesmo em um robô físico. A conversação tem um
construtor visual do diálogo para ajudar-lhe criar conversações naturais entre seus apps e usuários, sem necessitar de nenhuma
experiênciade codificação.

Para construir o Watson a IBM desenvolveu em uma arquitetura conhecida como DeepQA, essa arquitetura cria e persegue diversas
interpretações para a sentença analisada e gera diversas respostas plausíveis (hipóteses) com base em uma coleção de evidencias que
permite determinar se a hipótese é valida ou falsa.

## Vantagens de um Chatbot
Se bem configurado, esse programa vai simular ao máximo uma conversa humana e pode resolver dúvidas simples sobre pedidos, reservas e
horário de funcionamento, por exemplo, em alguns minutos com muita praticidade, e em tempo recorde. As empresas tem adotado esse sistema
cada vez mais e o Facebook já conta com mais de 18 mil chatbots rodando, o que aumentou o público do Messenger de 400 para 900 milhões
de usuários em todo o mundo.

Para os que possuem alto fluxo de interações e atendimento, investir nessa tecnologia pode ser essencial para resolver pequenos
problemas e desafogar as demandas por atendimento pessoal ou até mesmo em um atendimento telefonico. Facilitanto, por exemplo, compras de diversos tipos, informações sobre determinado serviço e etc, assim abrindo uma variadade de opções de automatizção de precessos.

## Desvantagens de um Chatbot
A utilização de chatbots acaba indo contra a humanização que as empresas estão buscando há algum tempo no contato com seus clientes. Por
esse motivo é importante levar em consideração dois pontos principais:

* Existência de casos em que só atedimento pessoal pode resolver: Em algumas situações, o contato pessoal é essencial para resolver o
problema. Escutar o que o cliente tem a dizer continua sendo importantíssimo para a sua marca, não só para resolver questões pessoais,
mas para se desenvolver. Por isso, é preciso encarar essas novas invenções como facilitadoras e não substitutas do trabalho humano. 

* Existência de casos em que o cliente prefere o contato pessoal: Nesse caso, cabe mais uma vez o estudo do seu público para entender sua
familiaridade com tecnologia e o quanto ele está aberto para experimentar novas ferramentas.

## Pré-requisitos para criar Chatbot em Node js
### 1-Heroku
Instalar o toolbelt Heroku: https://toolbelt.heroku.com para lançar, parar e monitorar instâncias. Inscreva- se gratuitamente em https://www.heroku.com se ainda não possuir uma conta. 

### 2-Node
Instalar Node: https://nodejs.org
Após a instalação, abra o terminal e execute o seguinte comando para obter a versão mais recente do npm:
```js
npm install npm -g
```

### 3- Clone do App do GitHub
Pode fazer um clone do diretório GitHub da aplicação através do comando no terminal:
```js
git clone https://github.com/fcamara-hpt/PoC_ChatBot
```
Após o clone, instale as dependências necessárias encontradas no package, para que o código funcione corretamente:
```js
npm install
```

### 3-Developers Facebook
Criar ou configurar um aplicativo ou página do Facebook aqui https://developers.facebook.com/apps/

### 4-Watson Conversation
Será necessario criar uma conta no Bluemix IBM para acessar o Conversation: https://www.ibmwatsonconversation.com
Conversation permite exportar e importar workspaces(dialogs). Para facilitar a execução do App, faço o import do workspace pronto contido na pasta em JSON.

## Rodando Chatbot
### Passos necessários:
Será necessário trocar algumas informações no aquirvo "app.js": 
* Alterar <USER> e <PASSWORD> do conversation para sua respectiva conta criada;
* Alterar <WORKSPACE_ID> pelo workspace_id, clicando em view detail no workspace que fo importado(no https://www.ibmwatsonconversation.com) ;
* Alterar <SENHA_DE_VERIFICAÇÃO> por uma possa usar futuramente para configurar Webhook no developers facebook;
* Alterar <PAGE_ACCESS_TOKEN> pelo token que será disponibilização para sua página. Você irá encontrar em "token generation" no 
developers facebook.

Crie uma instância no Heroku pelo terminal e coloque o código na nuvem:
```js
git init
git add .
git commit --message "Chatbot"
heroku create
git push heroku master
```
#### Configurando o seu App do facebook
* Na página de desenvolvimento do seu App no Facebook clique em ‘Webhooks’, depois New Subscription e por último Page.
* Na parte da URL utilize o endereço da sua instância do Heroku. Aqui tem dois pontos que você deve ter atenção: o primeiro é usar 
https e o segundo é colocar o /webhook no final do endereço.
* No token de verificação utilize o token utilizado no seu código.
* Na parte de Subscription Fields você deve selecionar: messages,message_deliveries, messaging_options e messaging_postbacks.
* Nesta mesma página, na parte de "Webhooks", selecione a página que você criou para o seu app no campo “Select a page to subscribe your webhook to the page events”.

Volte para o Terminal e digite este comando para acionar o aplicativo do Facebook para enviar mensagens. Lembre-se de usar o token
solicitado anteriormente.
```js
Curl -X POST " https://graph.facebook.com/v2.6/me/subscribed_apps?access_token= <PAGE_ACCESS_TOKEN> "
```

### Pronto, se realizado fielmente todos os passos listados até aqui, seu chatbot estará funcionando corretamente.
