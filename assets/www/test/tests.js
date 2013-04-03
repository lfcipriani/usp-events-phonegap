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
    new_obj.publishedDate = "Mon, 15 Apr 2013 08:45:25 -0700",
    list.create(new_obj);

    new_obj = _.clone(obj)
    new_obj.publishedDate = "Mon, 05 Apr 2013 08:45:25 -0700",
    list.create(new_obj);

    new_obj = _.clone(obj)
    new_obj.publishedDate = "Mon, 11 Apr 2013 08:45:25 -0700",
    list.create(new_obj);

    equal(list.first().publishedDate().getDate(), 5, "Primeiro item deve ser do dia 5");
    equal(list.last().publishedDate().getDate(), 15, "Último item deve ser do dia 15");
    equal(list.length, 3, "Lista deve ter 3 itens.");
});
