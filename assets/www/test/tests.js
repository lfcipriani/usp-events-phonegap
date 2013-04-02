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

module("Evento",{
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
    equal(evento.publishedDate().getDay(), 1, "Data de publicação como um objeto");
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

module("Storage",{
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

test("Salvar um evento existente", function() {
    ok(false, "Not Implemented");
});

test("Carregar um evento existente", function() {
    ok(false, "Not Implemented");
});

test("Alterar os atributos de um evento", function() {
    ok(false, "Not Implemented");
});

test("Apagar um evento", function() {
    ok(false, "Not Implemented");
});

