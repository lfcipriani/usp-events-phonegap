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
            var view = new NewsView({model: this.model});
            view.render().el;
            $.mobile.changePage("#newspage");
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

    window.SettingsView = Backbone.View.extend({
        el: $("#settingspage"),

        events: {
            "click #customize-btn": "customize",
            "click #cleardb-btn": "clearDB"
        },

        customize: function() {
            CustomizePage.render();
        },

        clearDB: function() {
        }

    });

    window.CustomizeView = Backbone.View.extend({
        el: $("#customizepage"),

        template: _.template($('#customize-template').html()),

        events: {
            "click #customize-save-btn": "saveSettings",
            "click #customize-back-btn": "backToSettings"
        },

        initialize: function() {
            this.customize = $("#customizelist");
            var that = this;
            $("#customizepage").on( "pagecreate", function( event ) {
                $('<div data-role="collapsible"></div>')
                    .html(that.template({ type: "tipo", section: "Tipo de Evento", collection: USP.eventTypes }))
                    .appendTo(that.customize);
                _.each(USP.eventDepartments, function(value, key) {
                    $('<div data-role="collapsible"></div>')
                        .html(that.template({ type: "departamento", section: key, collection: value }))
                        .appendTo(that.customize);
                });
            });

            $("#customizepage").on( "pageshow", function( event ) {
                _.each(Preferencias.get("selectedEventTypes"), function(t) {
                    $("#"+t).attr( "checked", true ).checkboxradio("refresh");
                });
                _.each(Preferencias.get("selectedDepartments"), function(t) {
                    $("#"+t).attr( "checked", true ).checkboxradio("refresh");
                });
            });
        },

        render: function() {
            $.mobile.changePage("#customizepage");
            return this;
        },

        saveSettings: function() {
            Preferencias.set("selectedEventTypes", $("input:checked.tipo").map(function(i, e){ return $(e).attr("name") }).get());
            Preferencias.set("selectedDepartments", $("input:checked.departamento").map(function(i, e){ return $(e).attr("name") }).get());
            Preferencias.save();
            EventosUSP.hardReset();
            EventosUSP.remoteFetch(Preferencias.feedURL());
            $.mobile.changePage("#settingspage");
        },

        backToSettings: function() {
            $.mobile.changePage("#settingspage");
        }

    });
    
    $.mobile.defaultPageTransition = 'none'; $.mobile.defaultDialogTransition = 'none';

    Preferencias = new Settings();
    Preferencias.fetch();
    EventosUSP = new EventList();

    HomePage = new HomeView();
    SettingsPage = new SettingsView(); 
    CustomizePage = new CustomizeView();
});

