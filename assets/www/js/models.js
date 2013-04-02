var Event = Backbone.Model.extend({

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
