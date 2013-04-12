var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    onDeviceReady: function() {
        console.log('deviceready');
        document.addEventListener("online", HomePage.onOnline , false);
        document.addEventListener("offline", HomePage.onOffline , false);
        document.addEventListener("resume", HomePage.onResume, false);
    }
};
app.initialize();

