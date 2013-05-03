//------ ENUMS ------//

ITEM_SESSION = {
    CONTAINER: "ITMContainer",
    CONTAINER_DESC: "ITMContainerDesc",
    MATERIALIZED_PATH: "ITMMaterializedPath",
    VIEW_TYPE: "ITMViewType",
    SUBURL: "ITMSubUrl",
    ITEM_ID: "ITMItemId",
    SORT_METHOD: "ITMSortMethod"
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
    COMPOSE: "item_compose",
    ITEM_VIEW: "item_view"
};

ITEM_RESERVED_KEYWORDS = ["new", "item"];

ITEM_SORT_METHOD = {
    DATE_ADDED: "date_added",
    NAME: "name"
}


//------ item template functions ------//

Template.items.child_containers = function () {
    var child_containers = ITMChildCategories.find().fetch();
    var url = suburl_to_current_path();
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
    } else if (Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.ITEM) {
        return Template[ITEM_TEMPLATE.ITEM_VIEW]();
    }
};

Template.items.back_url = function () {
    if (Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.ITEM) {
        return suburl_to_current_path();
    }
    else if (Session.get(ITEM_SESSION.VIEW_TYPE) == VIEW_TYPE.CREATE) {
        return suburl_to_current_path();
    } else {
        var path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
        var path_lis_len = path_lis.length;
        if (path_lis == null) {
            return "#";
        }

        //revert to root container
        else if (path_lis_len == 1) {
            return "/items";
        }

        var back_path_lis = path_lis.splice(0, path_lis_len - 1);
        return url_from_path(back_path_lis);
    }
};

Template.items.events = {
    "click .new_container": function (evt) {
        bootbox.prompt("Name of container to create?", function (container_name) {
            if (!container_name) {
                return;
            }
            bootbox.prompt("Description of " + container_name + "?", function (container_desc) {
                var path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
                if (path_lis) {
                    path_lis.push(container_name);
                } else {
                    path_lis = [container_name];
                }
                Meteor.call("put_container", path_lis, container_desc, function () {
                    init_items();
                });
            });
        });
    }
}

//------ item-container compose functions ------//

Template.item_compose.events = {
    'click .submit-btn': function (evt) {
        if ($("#item-compose-form").parsley("validate")) {
            $("#item-compose-form").submit();
        }
    }
}

Template.item_compose.back_url = suburl_to_current_path();

Template.item_compose.form_submit_url = function () {
    return BACKEND_URL + "item/";
};

Template.item_compose.path_lis_json = function () {
    var path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
    return JSON.stringify(path_lis);
};

Template.item_compose.redirect_to = function () {
    var suburl = suburl_to_current_path();
    return PLATFORM_URL + suburl.substring(1, suburl.length);
}

//------ item_breadcrumb template functions ------//

Template.item_breadcrumb.breadcrumbs = function () {
    var lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
    var array_lis = [];
    for (var i = 0; i < lis.length; i++) {
        var itm = lis[i];
        var sub_lis = lis.slice(0, i + 1);
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
    } else if (is_view_type(VIEW_TYPE.ITEM)) {
        return "View Item";
    }
};

//------ item_view template functions ------//

Template.item_view.item = function () {
    var item_id = Session.get(ITEM_SESSION.ITEM_ID);
    return ITMItems.findOne({_id: item_id });
};

//------ item_container template functions ------//

Template.item_container.events = {
    "click .sort_by_date": function () {
        Session.set(ITEM_SESSION.SORT_METHOD, ITEM_SORT_METHOD.DATE_ADDED);
    },
    "click .sort_by_name": function () {
        Session.set(ITEM_SESSION.SORT_METHOD, ITEM_SORT_METHOD.NAME);
    }
}

Template.item_container.rendered = function () {
    var width = $(".empty-img").width();
    $(".empty-img").height(width);
    $(".empty-img").css("line-height", width + "px");
    _.each($(".items .item .img-holder"), function (itm) {
        $(itm).height(width);
    });
}

Template.item_container.container_name = function () {
    var container_obj = Session.get(ITEM_SESSION.CONTAINER);
    if (container_obj == null) {
        var path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
        return path_lis.pop();
    }
    return container_obj.name;
};

Template.item_container.desc = function () {
    return Session.get(ITEM_SESSION.CONTAINER_DESC);
};

Template.item_container.total_items = function () {
    return ITMItems.find().count();
};

Template.item_container.sort_by_date = function () {
    return Session.get(ITEM_SESSION.SORT_METHOD) == ITEM_SORT_METHOD.DATE_ADDED;
}

Template.item_container.sort_by_name = function () {
    console.log(Session.get(ITEM_SESSION.SORT_METHOD));
    return Session.get(ITEM_SESSION.SORT_METHOD) == ITEM_SORT_METHOD.NAME;
}

Template.item_container.items = function () {
    var sort_method = {timestamp_utc: 1};
    if (Session.get(ITEM_SESSION) == ITEM_SORT_METHOD.NAME) {
        sort_method = {name: 1};
    }
    var all_items = ITMItems.find({}, {sort: sort_method}).fetch();
    var item_lis = [
        {
            is_empty: true
        }
    ];

    //push all populated items into items_obj
    _.each(all_items, function (itm) {
        itm.item_url = suburl_to_current_path() + "/item/" + itm._id;
        item_lis.push(itm);
    });

    //split items obj list into sublists of 5
    var split_lis = [];
    var sub_lis = {individual_item: []};
    var i = 0;
    var j = 5;
    _.each(item_lis, function (itm) {
        sub_lis.individual_item.push(itm);
        if (i % j == 0 && i > 0) {
            split_lis.push(sub_lis);
            sub_lis = {individual_item: []};
            j = 6;
            i = 0;
        }
        i++;
    });

    if (sub_lis.individual_item.length > 0) {
        split_lis.push(sub_lis);
    }

    return split_lis;
};

Template.item_container.new_item_url = function () {
    var url = suburl_to_current_path();
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

function suburl_to_current_path() {
    var path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
    return url_from_path(path_lis);
}

function is_materialized_path_null() {
    return Session.get(ITEM_SESSION.MATERIALIZED_PATH) == null;
}

function rehash_container_items() {
    ITMChildCategories.remove({});
    ITMItems.remove({});
    var path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
    Meteor.call("get_child_containers_and_items", path_lis, function (error, content) {
        console.log(content.description);
        Session.set(ITEM_SESSION.CONTAINER_DESC, content.description);
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
    Session.set(ITEM_SESSION.SORT_METHOD, ITEM_SORT_METHOD.DATE_ADDED);

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

        //first keyword
        if (_.contains(ITEM_RESERVED_KEYWORDS, keyword)) {
            Session.set(ITEM_SESSION.MATERIALIZED_PATH, path_lis.slice(0, path_lis.length));
            if (keyword == "new") {
                Session.set(ITEM_SESSION.VIEW_TYPE, VIEW_TYPE.CREATE);
            }
        }

        var keyword2 = path_lis.pop();
        if (_.contains(ITEM_RESERVED_KEYWORDS, keyword2)) {
            Session.set(ITEM_SESSION.MATERIALIZED_PATH, path_lis.slice(0, path_lis.length));
            if (keyword2 == "item") {
                Session.set(ITEM_SESSION.ITEM_ID, keyword);
                Session.set(ITEM_SESSION.VIEW_TYPE, VIEW_TYPE.ITEM);
            }
        }
    }

    rehash_container_items();
}

_init_items = init_items; //make function avail to other namespaces