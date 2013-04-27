Template.items.created = function () {
    Session.set("materialized_path", null);
    Meteor.call("get_child_containers_and_items", null, function (error, content) {
        _.each(content.child_containers, function (cat) {
            ITMChildCategories.insert(cat);
        });
    });
}

Template.items.child_containers = function () {
    return ITMChildCategories.find();
}

Template.items.is_root_container = function () {
    return Session.get("materialized_path") == null;
}

Template.items.materialized_path = function () {
    return Session.get("materialized_path");
}

Template.items.view = function() {
    return Template['select-container']();
}

function renderChildContainers() {
    Template.items.child_containers = Session.get("child_containers");
}