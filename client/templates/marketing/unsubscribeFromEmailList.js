Router.route("/u/:uid", {
    name: "unsubscribeFromEmailList",
    data: function () {
        uid = this.params.uid;
        Meteor.call("unsubscribeFromEmailList", uid, function(e, r) {
        });
    }
});
