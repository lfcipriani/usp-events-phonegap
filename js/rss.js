var RSS = {
    load: function(feedUrl, successCallback, errorCallback, options) {
        options = options || {}

        console.log("Acessando Feed: "+feedUrl);
        $.ajax({
            dataType: "json",
            url: options.url || 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=' + encodeURIComponent(feedUrl) + '&num=20&callback=?',
            timeout: options.timeout || 10000,
            success: function (data, textStatus) {
                if (data.responseStatus == "200") {
                    successCallback(data.responseData.feed, data.responseData.feed.entries);
                } else {
                    errorCallback(data.responseStatus, "Houve um problema com o feed de RSS");
                }
            },
            error: function (jqxhr, textStatus, error) {
                errorCallback("500", "Houve um problema com o Serviço do Google Feed API");
            }
        }); 

    }
};
