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
            console.log("Quero ler");
        }
    });

    window.HomeView = Backbone.View.extend({
        el: $("#homepage"),

        initialize: function() {
            this.listenTo(EventosUSP, 'add', this.addOne);
            //this.listenTo(EventosUSP, 'reset', this.addAll);
            //this.listenTo(EventosUSP, 'all', this.render);

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

    Preferencias = new Settings();
    EventosUSP = new EventList();

    HomePage = new HomeView();

});

