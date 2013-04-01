
//successCallback(feed, entries)
//errorCallback(status, text) 408 timeout, 400 bad request

var RSS = {
    load: function(feedUrl, successCallback, errorCallback) {

        $.ajax({
            dataType: "json",
            url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=' + encodeURIComponent(feedUrl) + '&num=20&callback=?',
            timeout: 10000,
            success: function (data, textStatus) {
                if (data.responseStatus == "200") {
                    successCallback(data.responseData.feed, data.responseData.feed.entries);
                } else {
                    console.log("Ocorreu um erro na hora de recuperar o feed.");
                    console.log(data.responseStatus + " - " + data.responseDetails)
                }
            },
            error: function (jqxhr, textStatus, error) {
                var err = textStatus + ', ' + error;
                console.log("Request Failed: " + err);
                $('<p>Request Failed: ' + err + '</p>').appendTo('#result');
            }
        }); 

    }


}
