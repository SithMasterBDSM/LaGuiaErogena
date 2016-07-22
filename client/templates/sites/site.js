Router.route("/cajeros", {
    name: "site",
    loadingTemplate: "siteLoading",
    data: function () {
        return true;
    },
    waitOn: function () {
        console.log("accediendo a la base de datos.");
        return [Meteor.subscribe("corporateEntity"), Meteor.subscribe("site")];
    }
});

Template.site.helpers({
    beforeRemove: function () {
        return function (collection, id) {
            var doc = collection.findOne(id);
            if (confirm('¿Está seguro que desea eliminar el cajero "' + doc.nameSpa + '"?')) {
                this.remove();
            }
        };
    },
    getSiteByFinancialEntity: function () {
        if (valid(Session.get("idFinancialEntity"))) {
            Meteor.call("siteListByFilters", { idFinancialEntity: Session.get("idFinancialEntity") }, function (err, result) {
                if (!valid(err)) {
                    Session.set("siteList", result);
                }
            });
        }
    },
    siteList: function () {
        return Session.get("siteList");
    }
});

Template.site.events({
    "change #corporateEntity": function (event, template) {
        Session.set("idFinancialEntity", $(event.target).val());
    },
    "click .editSite": function (event, template) {
        if (!valid(event.target.dataset.siteid)) {
            return false;
        }
        Meteor.call("siteById", event.target.dataset.siteid, function (err, result) {
            if (!valid(err)) {
                Session.set("selectedSite", result);
                $("#siteUpdateForm").modal("show");
            }
        });
    },
    "click .import-sites": function (event, template) {
        if (confirm("¿Está seguro que desea importar la lista de cajeros?")) {
            alert("Se iniciará el proceso de importación.");
            Meteor.call("ImportSites", "public/excel/CAJEROS DE BOGOTA.xlsx", function (err, result) {
                if (!valid(err)) {
                    for (var q = 0; q < result.sheets.length; q++) {
                        var bank = corporateEntity.find({ nameSpa: titleCase(result.sheets[q]) });
                        if (bank.count() <= 0) {
                            corporateEntity.insert({
                                nameSpa: titleCase(result.sheets[q]),
                                isOriginalLogoAllowed: false,
                                originalLogoPath: "ExWEoarAc6LJgd65v",
                                alternateLogoPath: "ExWEoarAc6LJgd65v"
                            });
                            bank = corporateEntity.find({ nameSpa: titleCase(result.sheets[q]) }).fetch()[0];
                        } else {
                            bank = bank.fetch()[0];
                        }
                        var sites = result.sites[q];
                        if (sites.length > 0) {
                            console.log("Comenzando la importación de cajeros del Banco " + bank.nameSpa + "...");
                            for (var i = 1; i < sites.length; i++) {
                                if (valid(sites[i].address)) {
                                    if (site.find({ address: sites[i].address, nameSpa: sites[i].nameSpa }).count() <= 0) {
                                        Meteor.call("addSiteFromGeocoding", sites[i], bank, i);
                                    }
                                }
                            }
                            console.log("Terminó la importación de cajeros del Banco " + bank.nameSpa + ". Se importaron: " + sites.length + " (Según listado de Excel).");
                        } else {
                            console.log("No hay ningún cajero que importar del Banco " + bank.nameSpa + ".");
                        }
                    }
                    alert("Importación terminada con éxito. Tomará unos minutos poder ver todos los cajeros registrados.");
                } else {
                    alert("La importación terminó con errores inesperados. De haber una inconsistencia por favor ejecute nuevamente la importación.");
                }
            });
        }
    }
});


/**
VIEW SPECIFIC SITE
*/
var MAP_ZOOM = 15;
Template.siteUpdateForm.helpers({
    currentSite: function () {
        return Session.get("selectedSite");
    }
});
