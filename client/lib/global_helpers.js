Template.registerHelper("getFinancialEntities", function () {
    return corporateEntity.find().map(function (corporateEntity) {
        return { label: corporateEntity.nameSpa, value: corporateEntity._id };
    });
});
