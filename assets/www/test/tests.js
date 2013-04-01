module("RSS");

asyncTest( "carregamento com sucesso da URL de feed", function() {

/*    $.mockjax({*/
        //url: 'https://ajax.googleapis.com/ajax/services/feed/*',
        ////proxy: "/mocks/feed.json",
        //responseText: "bla",
        //status: 200,
        //responseTime: 200
    //});

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
