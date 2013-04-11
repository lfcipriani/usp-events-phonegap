module("RSS");

asyncTest( "carregamento com sucesso da URL de feed", function() {
    expect(2);
    RSS.load("http://www.eventos.usp.br/?event-types=evento-cientifico&feed=rss",
        function(feed, entries) {
            equal(feed.title, "USP Eventos - Universidade de São Paulo » Evento científico", "RSS feed possui título");
            ok(feed.entries, "Existe um array de entradas no feed");
            start();
        },
        function(status, text) {
        }
    );
});

asyncTest( "URL de feed errada", function() {
    expect(2);
    RSS.load("http://www.eventos.usp.br/?event-types=evento-errado&feed=rss",
        function(feed, entries) {
        },
        function(status, text) {
            equal(status, "400", "Serviço da USP retorna Bad Request");
            equal(text, "Houve um problema com o feed de RSS", "Mensagem de erro é retornada");
            start();
        }
    );
});

asyncTest( "Serviço de feed do Google está com problema", function() {
    expect(2);
    RSS.load("http://www.eventos.usp.br/?event-types=evento-errado&feed=rss",
        function(feed, entries) {
            console.log("Isso não deveria ser executado.");
        },
        function(status, text) {
            equal(status, "500", "Serviço do Google retorna Internal Server Error");
            equal(text, "Houve um problema com o Serviço do Google Feed API", "Mensagem de erro é retornada");
            start();
        },
        { 
            url: "https://ajax.googleapis.com/ajax/wrong/feed/load?v=1.0&q=" + encodeURIComponent("http://www.eventos.usp.br/?event-types=evento-cientifico&feed=rss") + "&num=20&callback=?",
            timeout: 1000
        }
    );
});

//-----------------------------------------------------------------------------

module("Event",{
    setup: function() {
        evento = new Event({
            title: "Um titulo",
            link: "http://www.example.com",
            publishedDate: "Mon, 01 Apr 2013 08:45:25 -0700",
            author: "ICMC",
            description: "uma descricao",
            content: "um conteudo em html"
        });
    }, teardown: function() {
    }
});

test("Criar um novo objeto evento a partir dos dados do feed", function() {
    equal(evento.get('title'), "Um titulo", "Titulo deve estar correto");
    equal(evento.get('link'), "http://www.example.com", "Link deve estar correto");
    equal(evento.id, "http://www.example.com", "ID deve estar correto");
    equal(evento.get('publishedDate'), "Mon, 01 Apr 2013 08:45:25 -0700", "Publicação deve estar correta");
    equal(evento.get('author'), "ICMC", "Autor deve estar correto");
    equal(evento.get('description'), "uma descricao", "Descricao deve estar correto");
    equal(evento.get('content'), "um conteudo em html", "Conteudo deve estar correto");
});

test("Data de publicação deve estar disponível como um objeto", function() {
    equal(evento.publishedDate().getDate(), 1, "Data de publicação como um objeto");
});

test("Validar um evento com atributos válidos", function() {
    ok(evento.isValid(), "Evento deve ser válido");
});

test("Invalidar um evento com atributos inválidos", function() {
    evento.unset("title");
    evento.set({link: null});
    evento.set({publishedDate: "not a date"});
    ok(!evento.isValid(), "Evento deve alertar que é inválido")
});

//-----------------------------------------------------------------------------

module("EventList",{
    setup: function() {
    }, teardown: function() {
        window.localStorage.clear();
    }
});

test("Os itens devem ser do tipo Event", function() {
    var list = new EventList();

    equal(list.model, Event, "Model deve ser Event");
});

test("Persistir os eventos da lista no localStorage", function() {
    var list = new EventList();

    evento = list.create({
        title: "Um titulo",
        link: "http://www.example.com",
        publishedDate: "Mon, 01 Apr 2013 08:45:25 -0700",
        author: "ICMC",
        description: "uma descricao",
        content: "um conteudo em html"
    });

    equal(JSON.parse(window.localStorage.getItem("usp-events-" + evento.id)).title, "Um titulo", "Evento armazenado deve ser o que foi criado.");
});

test("Adicionar mesmo evento na lista faz com que ele não seja salvo novamente no localStorage", function() {
    var list = new EventList();

    evento = list.create({
        title: "Um titulo",
        link: "http://www.example.com",
        publishedDate: "Mon, 01 Apr 2013 08:45:25 -0700",
        author: "ICMC",
        description: "uma descricao",
        content: "um conteudo em html"
    });

    evento = list.create({
        title: "Um titulo",
        link: "http://www.example.com",
        publishedDate: "Mon, 01 Apr 2013 08:45:25 -0700",
        author: "ICMC",
        description: "uma descricao",
        content: "um conteudo em html"
    });

    equal(JSON.parse(window.localStorage.getItem("usp-events-" + evento.id)).title, "Um titulo", "Evento armazenado deve ser o que foi criado.");
    equal(list.length, 1, "Lista deve ter tamanho 1");
});


test("Eventos offline devem ser carregados a partir do localStorage", function() {
    var list = new EventList();

    evento = list.create({
        title: "Um titulo",
        link: "http://www.example.com",
        publishedDate: "Mon, 01 Apr 2013 08:45:25 -0700",
        author: "ICMC",
        description: "uma descricao",
        content: "um conteudo em html"
    });

    var new_list = new EventList();
    new_list.fetch();

    equal(JSON.parse(window.localStorage.getItem("usp-events-" + evento.id)).title, "Um titulo", "Evento armazenado deve ser o que foi criado.");
    equal(new_list.get(evento.id).get("title"), "Um titulo", "Em uma nova lista, evento armazenado deve ser o que foi criado.");
});

test("Eventos devem ser armazenados em ordem cronológica de publicação", function() {
    var list = new EventList();

    obj = {
        title: "Um titulo",
        link: "http://www.example.com",
        publishedDate: "Mon, 01 Apr 2013 08:45:25 -0700",
        author: "ICMC",
        description: "uma descricao",
        content: "um conteudo em html"
    };

    new_obj = _.clone(obj)
    new_obj.publishedDate = "Mon, 11 Apr 2013 08:45:25 -0700";
    new_obj.link = "http://www.example.com/1";
    list.create(new_obj);

    new_obj = _.clone(obj)
    new_obj.publishedDate = "Mon, 05 Apr 2013 08:45:25 -0700";
    new_obj.link = "http://www.example.com/2";
    list.create(new_obj);

    new_obj = _.clone(obj)
    new_obj.publishedDate = "Mon, 15 Apr 2013 08:45:25 -0700";
    new_obj.link = "http://www.example.com/3";
    list.create(new_obj);

    equal(list.first().publishedDate().getDate(), 5, "Primeiro item deve ser do dia 5");
    equal(list.last().publishedDate().getDate(), 15, "Último item deve ser do dia 15");
    equal(list.length, 3, "Lista deve ter 3 itens.");
});

test("Lista de eventos deve poder ser apagada.", function() {
    var list = new EventList();

    obj = {
        title: "Um titulo",
        link: "http://www.example.com",
        publishedDate: "Mon, 01 Apr 2013 08:45:25 -0700",
        author: "ICMC",
        description: "uma descricao",
        content: "um conteudo em html"
    };

    new_obj = _.clone(obj);
    new_obj.publishedDate = "Mon, 11 Apr 2013 08:45:25 -0700";
    new_obj.link = "http://www.example.com/1";
    list.create(new_obj);

    new_obj = _.clone(obj);
    new_obj.publishedDate = "Mon, 05 Apr 2013 08:45:25 -0700";
    new_obj.link = "http://www.example.com/2";
    list.create(new_obj);

    new_obj = _.clone(obj);
    new_obj.publishedDate = "Mon, 15 Apr 2013 08:45:25 -0700";
    new_obj.link = "http://www.example.com/3";
    new_obj = list.create(new_obj);

    equal(list.length, 3, "Lista deve ter 3 itens.");
    equal(JSON.parse(window.localStorage.getItem("usp-events-" + new_obj.id)).title, "Um titulo", "Evento armazenado deve ser o que foi criado.");
    list.hardReset();
    equal(list.length, 0, "Lista deve ter 0 itens.");
    ok(_.isNull(window.localStorage.getItem("usp-events-" + new_obj.id)), "Evento armazenado não deve mais existir no local storage.");
});


//-----------------------------------------------------------------------------

module("Configuracao", {
    setup: function() {
    }, teardown: function() {
        window.localStorage.clear();
    }
});

test("Array de Tipos de eventos do feed deve estar com todos os tipos selecionados como padrão.", function(){
    var conf = new Settings();
    equal(conf.get("selectedEventTypes")[0], 'cultura-e-artes');
    equal(conf.get("selectedEventTypes")[1], 'esportes');
    equal(conf.get("selectedEventTypes")[2], 'evento-cientifico');
    equal(conf.get("selectedEventTypes")[3], 'evento-cientifico-biologicas');
    equal(conf.get("selectedEventTypes")[4], 'evento-cientifico-exatas');
    equal(conf.get("selectedEventTypes")[5], 'evento-cientifico-humanas');
    equal(conf.get("selectedEventTypes")[6], 'institucional');
    equal(conf.get("selectedEventTypes")[7], 'outros');
});

test("Array de Departamentos deve estar com nenhum tipo selecionado como padrão.", function(){
    var conf = new Settings();
    equal(conf.get("selectedDepartments").length, 0, "Não deve haver nenhum departamento selecionado como default");
});

test("URL do feed gerado deve ser no padrão correto", function(){
    var conf = new Settings();
    equal(conf.feedURL(), "http://www.eventos.usp.br/?event-types=cultura-e-artes,esportes,evento-cientifico,evento-cientifico-biologicas,evento-cientifico-exatas,evento-cientifico-humanas,institucional,outros&feed=rss", "URL default");

    conf.set("selectedDepartments", ["iqsc-instituto-de-quimica-de-sao-carlos"]);
    conf.set("selectedEventTypes", ["cultura-e-artes"]);
    equal(conf.feedURL(), "http://www.eventos.usp.br/?campi-unidades=iqsc-instituto-de-quimica-de-sao-carlos&event-types=cultura-e-artes&feed=rss", "URL com um departamento e um tipo de evento.");
    
    conf.set("selectedDepartments", ["iqsc-instituto-de-quimica-de-sao-carlos", "fmrp-hemocentro"]);
    conf.set("selectedEventTypes", ["cultura-e-artes"]);
    equal(conf.feedURL(), "http://www.eventos.usp.br/?campi-unidades=iqsc-instituto-de-quimica-de-sao-carlos,fmrp-hemocentro&event-types=cultura-e-artes&feed=rss", "URL com dois departamentos e um tipo de evento.");
});

test("Preferências do usuário devem ser salvas no Local Storage", function(){
    var conf = new Settings();

    conf.set("selectedDepartments", ["iqsc-instituto-de-quimica-de-sao-carlos"]);
    conf.set("selectedEventTypes", ["cultura-e-artes"]);
    conf.save();

    var new_conf = new Settings();
    new_conf.fetch();
    equal(conf.feedURL(), "http://www.eventos.usp.br/?campi-unidades=iqsc-instituto-de-quimica-de-sao-carlos&event-types=cultura-e-artes&feed=rss", "Checando se a URL está com os parametros salvos anteriormente.");
});

