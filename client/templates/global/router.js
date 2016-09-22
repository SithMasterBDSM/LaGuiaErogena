/**
Rutas de acceso: acá aparecen únicamente páginas de ingreso tipo "landing 
pages". Nótese que en este proyecto se tienen varios archivos en formato
.js (ecmascript / JavaScript) asociados con las plantillas en SpaceBars
(.html). En dichos módulos se definen otras rutas.
*/

Router.configure({layoutTemplate: "layout"});
Router.route("/", {name: "home",
    onAfterAction: function () {
        Session.set("showHeader", false);
        Session.set("showFooter", false);
    }});
