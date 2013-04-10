$(function() {

    window.EventView = Backbone.View.extend({
        tagName: "li",
        className: "feed-entry",

        template: _.template($('#event-template').html()),

        events: {
            "click": "readEvent"
        },

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        readEvent: function() {
            console.log(this.model);
            var view = new NewsView({model: this.model});
            view.render().el;
            $.mobile.changePage("#newspage", { transition: "slide" });
        }
    });

    window.HomeView = Backbone.View.extend({
        el: $("#homepage"),

        initialize: function() {
            this.listenTo(EventosUSP, 'add', this.addOne);

            this.main = $('#main');

            EventosUSP.fetch();
            EventosUSP.remoteFetch(Preferencias.feedURL());
        },

        render: function() {
        },

        addOne: function(evento) {
            var view = new EventView({model: evento});
            this.$("#feed-list").prepend(view.render().el).listview("refresh");
        }

    });

    window.NewsView = Backbone.View.extend({
        el: $("#newspage"),

        template: _.template($('#corpo-template').html()),

        initialize: function() {
            this.corpo = $("#corpo");
        },

        render: function() {
            this.corpo.html(this.template(this.model.toJSON()));
            $("#newscontent").html(this.model.get("content"));
            return this;
        }
    });

    Preferencias = new Settings();
    EventosUSP = new EventList();

    HomePage = new HomeView();

});

