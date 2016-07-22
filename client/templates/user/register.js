Template.register.events({
    "submit form": function () {
        event.preventDefault();
        var email = $("[name=email]").val();
        var password = $("[name=password]").val();
        var name = $("[name=name]").val();
        Accounts.createUser({
            email: email,
            password: password,
            profile: {
                name: name
            }
        }, function (err, result) {
            if (!err) {
                $("#registerForm").modal("hide");
            } else {
                alert(err.reason);
            }
        });
    }
});
