Router.route("/entidades", {
    name: "corporateEntity",
    loadingTemplate: "corporateEntityLoading",
    data: function () {
        return true;
    },
    waitOn: function () {
        return [Meteor.subscribe("corporateEntity")];
    }
});

/*
* LIST OF FINANCIAL ENTITIES
*/
Template.corporateEntity.helpers({
    beforeRemove: function () {
        return function (collection, id) {
            var doc = collection.findOne(id);
            if (confirm('¿Está seguro que desea eliminar la entidad financiera "' + doc.nameSpa + '"?')) {
                this.remove();
            }
        };
    },
    getfinantialEntities: function () {
        console.log(corporateEntity.find());
        return corporateEntity.find();
    }
});

Template.corporateEntity.events({
    "click .editFinancialEntity": function (event, template) {
        event.preventDefault();
        if (!valid(event.target.dataset.financialentityid)) {
            return false;
        }
        Session.set("selectedFinancialEntity", event.target.dataset.financialentityid);
        $("#corporateEntityUpdateForm").modal("show");
    }
});

/**
UPDATE FINANCIAL ENTITY
*/
Template.corporateEntityUpdateForm.helpers({
    getFinancialEntity: function () {
        return corporateEntity.findOne({ _id: Session.get("selectedFinancialEntity") });
    }
});
