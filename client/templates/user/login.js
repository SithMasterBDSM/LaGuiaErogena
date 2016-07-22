Template.login.events({
    'submit form': function (event, target) {
        event.preventDefault();
        Meteor.loginWithPassword(event.target.email.value, event.target.password.value, function (err, result) {
            if (!err) {
                $("#loginForm").modal("hide");
            } else {
                alert(err.reason);
            }
        });
    }
});
