var Event = Backbone.Model.extend({

    idAttribute: "link",
    publishedDate: function() {
        return new Date(this.get('publishedDate'));
    },

    validate: function(attrs, options) {
        errors = "";

        if (!attrs.title || !_.isString(attrs.title)) {
            errors += "Título é obrigatório - ";
        }
        if (!attrs.link || !_.isString(attrs.link)) {
            errors += "Link é obrigatório - ";
        }
        if (!attrs.publishedDate || !_.isString(attrs.publishedDate)) {
            errors += "Data de publicação é obrigatório - ";
        } else if (!_.isDate(new Date(attrs.publishedDate))) {
            errors += "Data de publicação não é um formato válido - ";
        }

        if (errors.length > 0) {
            return errors;
        }
    }

});

var EventList = Backbone.Collection.extend({
    model: Event,
    localStorage: new Backbone.LocalStorage("usp-events"),

    comparator: function(an_event) {
        return (new Date(an_event.publishedDate())).getTime();
    },

    remoteFetch: function(feedURL) {
        var mostRecentEvent = this.length ? this.first().publishedDate().getTime() : 0;
        var that = this;
        $.mobile.loading("show");
        RSS.load(feedURL,
            function(feed, entries) {
                newEntries = _.reject(entries, function(e) { return new Date(e.publishedDate).getTime() <= mostRecentEvent});
                newEntries = _.sortBy(newEntries, function(e) { return new Date(e.publishedDate).getTime(); });
                _.each(newEntries, function(e) {
                    that.create({
                        title: e.title,
                        link: e.link,
                        publishedDate: e.publishedDate,
                        author: e.author,
                        description: e.contentSnippet,
                        content: e.content
                    });
                });
                $('#status-btn').buttonMarkup({ icon: "feed-go" });
                $('#statusHint').html('<p>Você está online :-)</p>');
                $.mobile.loading("hide");
            },
            function(status, text) {
                console.log("RSS load fail: "+ text)
                $('#status-btn').buttonMarkup({ icon: "feed-error" });
                $('#statusHint').html('<p>Você está offline :-(<br />Mas os eventos salvos locamente estão disponíveis.</p>').popup("open");
                $.mobile.loading("hide");
            }
        );
    
    },

    hardReset: function() {
        this.reset();
        this.localStorage._clear();
    }
});

var Settings = Backbone.Model.extend({

    localStorage: new Backbone.LocalStorage("usp-settings"),

    defaults: function() {
        this.set("selectedEventTypes", _.keys(USP.eventTypes));
        this.set("selectedDepartments", []);
        this.id = "user";
    },

    validate: function(attrs, options) {
        errors = "";

        if (attrs.selectedEventTypes.length == 0) {
            errors += "Você deve selecionar pelo menos um tipo de evento";
        }

        if (errors.length > 0) {
            return errors;
        }
    },

    feedURL: function() {
        var url = "http://www.eventos.usp.br/?";
        if (this.get("selectedDepartments").length > 0) {
            url += "campi-unidades=" + this.get("selectedDepartments").join() + "&";
        }
        url += "event-types=" + this.get("selectedEventTypes").join() + "&";
        url += "feed=rss";
        return url;
    }
});

