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
