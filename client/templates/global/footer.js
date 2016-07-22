/**
El pié de página no se muestra en el mapa para maximizar el espacio disponible.
*/
Template.footer.helpers({
    showFooter: function () {
        return !valid(Session.get("showFooter")) ? true : Session.get("showFooter");
    }
});
