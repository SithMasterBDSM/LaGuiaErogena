Template.header.events({
    'click .logout': function (event) {
        event.preventDefault();
        Meteor.logout();
    }
});

Template.header.helpers({
    showHeader: function () {
        return !valid(Session.get('showHeader')) ? true : Session.get('showFooter');
    }
});