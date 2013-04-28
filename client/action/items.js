//------ ENUMS ------//

ITEM_SESSION = {
    CONTAINER: "ITMContainer",
    MATERIALIZED_PATH: "ITMMaterializedPath",
    VIEW_TYPE: "ITMViewType",
    SUBURL: "ITMSubUrl"
};

VIEW_TYPE = {
    CONTAINER: "ITM_VT_Container",
    ITEM: "ITM_VT_Item",
    CREATE: "ITM_VT_Create",
    UPDATE: "ITM_VT_Update"
};

ITEM_TEMPLATE = {
    BASE: "items",
    SELECT_CONTAINER: "select-container",
    ITEMS: "item_container",
    COMPOSE: "item_compose"
};

ITEM_RESERVED_KEYWORDS = ["new"];


//------ item template functions ------//

Template.items.child_containers = function () {
    var child_containers = ITMChildCategories.find().fetch();
    var url = url_to_current_path();
    var container_array = [];
    _.each(child_containers, function (cat) {
        container_array.push({
            name: cat.name,
            url: url + "/" + cat.name
        });
    });
    return container_array;
};

Template.items.is_root_container = function () {
    return is_materialized_path_null();
};

Template.items.materialized_path = function () {
    return Session.get(ITEM_SESSION.MATERIALIZED_PATH);
};

Template.items.view = function () {
    if (Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.CONTAINER) {
        if (is_materialized_path_null()) {
            return Template[ITEM_TEMPLATE.SELECT_CONTAINER]();
        } else {
            return Template[ITEM_TEMPLATE.ITEMS]();
        }
    } else if (Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.CREATE) {
        return Template[ITEM_TEMPLATE.COMPOSE]();
    }
};

Template.items.events = {
    'click #go-back-parent-nav': function () {
        console.log("clicked");
        var path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
        var path_lis_len = path_lis.length;

        //null check
        if (path_lis == null) {
            return;
        }

        //revert to root container
        else if (path_lis_len == 1) {
            Session.set(ITEM_SESSION.MATERIALIZED_PATH, null);
        }

        //splice path_lis
        else {
            Session.set(ITEM_SESSION.MATERIALIZED_PATH, path_lis.splice(0, path_lis_len - 1));
        }

        rehash_container_items();
    }

};

//------ item-container compose functions ------//

Template.item_compose.events = {
    "click #cancel-save-item": function (evt) {
        evt.preventDefault();
        window.location = "/items";
    }
};

Template.item_compose.back_url = url_to_current_path();

//------ item_breadcrumb template functions ------//


Template.item_breadcrumb.breadcrumbs = function () {
    var lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
    var array_lis = [];
    for (var i = 0; i < lis.length; i++) {
        var itm = lis[i];
        var sub_lis = lis.splice(0,i+1);

        array_lis.push({
            name: itm,
            url: url_from_path(sub_lis)
        });
    }
    return array_lis;
};

Template.item_breadcrumb.active = function () {
    if (is_view_type(VIEW_TYPE.CONTAINER)) {
        return "All";
    } else if (is_view_type(VIEW_TYPE.CREATE)) {
        return "New Item";
    }
}

//------ item_container template functions ------//

Template.item_container.container_name = function () {
    var container_obj = Session.get(ITEM_SESSION.CONTAINER);
    if (container_obj == null) {
        var path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
        return path_lis.pop();
    }
    return container_obj.name;
};

Template.item_container.desc = function () {
    var container_obj = Session.get(ITEM_SESSION.CONTAINER);
    if (container_obj == null) {
        return "";
    }
    return container_obj.description;
};

Template.item_container.total_items = function () {
    return ITMItems.find().count();
};

Template.item_container.items = function () {
    var all_items = ITMItems.find({}).fetch();
    var items_obj = [
        {individual_item: [
            {
                is_empty: true
            }
        ]}
    ];
    var i = 0;
    _.each(all_items, function (itm) {
        var j = 0;
        _.each(items_obj, function (row) {
            if (i == 0 && j == 0) {
                return; //do nth
            } else if (j < 5) {
                row.push({
                    is_empty: false
                });
            }
            j = 1 + 1;
        });
        i = i + 1;
    });
    return items_obj;
};

Template.item_container.new_item_url = function () {
    var url = url_to_current_path();
    return url + "/new";
};

//------ helper functions ------//

function url_from_path(path_lis) {
    var url = "/items";
    if (path_lis) {
        _.each(path_lis, function (component) {
            url = url + "/" + component;
        });
    }
    return url;
}

function url_to_current_path() {
    var path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
    return url_from_path(path_lis);
}

function is_materialized_path_null() {
    console.log(Session.get(ITEM_SESSION.MATERIALIZED_PATH));
    return Session.get(ITEM_SESSION.MATERIALIZED_PATH) == null;
}

function rehash_container_items() {
    ITMChildCategories.remove({});
    var path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
    Meteor.call("get_child_containers_and_items", path_lis, function (error, content) {
        _.each(content.items, function (item) {
            ITMItems.insert(item);
        });
        _.each(content.child_containers, function (cat) {
            ITMChildCategories.insert(cat);
        });
    });
}

function is_view_type(view_type) {
    return Session.get(ITEM_SESSION.VIEW_TYPE) == view_type;
}

function init_items() {
    //defaults
    Session.set(ITEM_SESSION.CONTAINER, null);
    Session.set(ITEM_SESSION.MATERIALIZED_PATH, null);
    Session.set(ITEM_SESSION.VIEW_TYPE, VIEW_TYPE.CONTAINER);

    //now lets overwrite the defaults
    var path_lis_str = Session.get(ITEM_SESSION.SUBURL);
    var path_lis;
    if (path_lis_str) {
        path_lis_str = decodeURIComponent(path_lis_str);
        path_lis = path_lis_str.split("/");
        Session.set(ITEM_SESSION.MATERIALIZED_PATH, path_lis);
    }

    //view type and special keywords
    if (path_lis_str) {
        var keyword = path_lis.pop();
        if (_.contains(ITEM_RESERVED_KEYWORDS, keyword)) {
            Session.set(ITEM_SESSION.MATERIALIZED_PATH, path_lis.splice(0, path_lis.length));
            if (keyword == "new") {
                Session.set(ITEM_SESSION.VIEW_TYPE, VIEW_TYPE.CREATE);
            }
        }
    }

    rehash_container_items();
}

_init_items = init_items; //make function avail to other namespaces