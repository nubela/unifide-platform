// Generated by CoffeeScript 1.6.3
(function() {
  var ITEM_RESERVED_KEYWORDS, ITEM_SORT_METHOD, ITEM_TEMPLATE, VIEW_TYPE, createItem, init_items, is_materialized_path_null, is_view_type, rehash_container_items, suburl_to_current_path_for_items, url_from_path;

  this.ITEM_SESSION = {
    CONTAINER: "ITMContainer",
    CONTAINER_DESC: "ITMContainerDesc",
    MATERIALIZED_PATH: "ITMMaterializedPath",
    VIEW_TYPE: "ITMViewType",
    SUBURL: "ITMSubUrl",
    ITEM_ID: "ITMItemId",
    CUSTOM_ATTRS: "ITMCustomAttr",
    CUSTOM_MEDIA: "ITMCustomImg",
    CUSTOM_TAGS: "ITMCustomTags",
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

  ITEM_RESERVED_KEYWORDS = ["new", "item", "update"];

  ITEM_SORT_METHOD = {
    DATE_ADDED: "date_added",
    NAME: "name"
  };

  url_from_path = function(path_lis) {
    var url;
    url = "/items";
    if (path_lis != null) {
      _.each(path_lis, function(component) {
        return url = url + "/" + component;
      });
    }
    return url;
  };

  suburl_to_current_path_for_items = function() {
    var path_lis;
    path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
    return url_from_path(path_lis);
  };

  is_materialized_path_null = function() {
    return Session.get(ITEM_SESSION.MATERIALIZED_PATH) === null;
  };

  rehash_container_items = function() {
    var path_lis;
    path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
    Meteor.subscribe("container_item_media", path_lis);
    Meteor.subscribe("child_containers", path_lis);
    return Meteor.subscribe("container_items", path_lis);
  };

  is_view_type = function(view_type) {
    return Session.get(ITEM_SESSION.VIEW_TYPE) === view_type;
  };

  init_items = function() {
    var keyword, keyword2, path_lis, path_lis_str;
    Session.set(ITEM_SESSION.CONTAINER, null);
    Session.set(ITEM_SESSION.MATERIALIZED_PATH, null);
    Session.set(ITEM_SESSION.VIEW_TYPE, VIEW_TYPE.CONTAINER);
    Session.set(ITEM_SESSION.SORT_METHOD, ITEM_SORT_METHOD.DATE_ADDED);
    Session.set(ITEM_SESSION.CUSTOM_ATTRS, []);
    Session.set(ITEM_SESSION.CUSTOM_MEDIA, []);
    Session.set(ITEM_SESSION.CUSTOM_TAGS, []);
    path_lis_str = Session.get(ITEM_SESSION.SUBURL);
    if (path_lis_str != null) {
      path_lis_str = decodeURIComponent(path_lis_str);
      path_lis = path_lis_str.split("/");
      Session.set(ITEM_SESSION.MATERIALIZED_PATH, path_lis);
    }
    if (path_lis_str != null) {
      keyword = path_lis.pop();
      if (_.contains(ITEM_RESERVED_KEYWORDS, keyword)) {
        Session.set(ITEM_SESSION.MATERIALIZED_PATH, path_lis.slice(0, path_lis.length));
        if (keyword === "new") {
          Session.set(ITEM_SESSION.VIEW_TYPE, VIEW_TYPE.CREATE);
        }
      }
      keyword2 = path_lis.pop();
      if (_.contains(ITEM_RESERVED_KEYWORDS, keyword2)) {
        Session.set(ITEM_SESSION.MATERIALIZED_PATH, path_lis.slice(0, path_lis.length));
        if (keyword2 === "item") {
          Session.set(ITEM_SESSION.ITEM_ID, keyword);
          Session.set(ITEM_SESSION.VIEW_TYPE, VIEW_TYPE.ITEM);
        } else if (keyword2 === "update") {
          Session.set(ITEM_SESSION.ITEM_ID, keyword);
          Session.set(ITEM_SESSION.VIEW_TYPE, VIEW_TYPE.UPDATE);
        }
      }
    }
    return rehash_container_items();
  };

  createItem = function() {
    var all_file_input, all_file_input_load_status, data_lis, f, fileReaderOnLoad, i, submitItemCreation, _i, _j, _len, _ref, _results;
    all_file_input_load_status = {};
    submitItemCreation = function() {
      var alert, data, obj, _i, _len;
      data = {};
      for (_i = 0, _len = data_lis.length; _i < _len; _i++) {
        obj = data_lis[_i];
        data[obj.name] = obj.value;
      }
      alert = newAlert("Creating..", "Your item is being uploaded, please hold on and do not refresh the page.", false);
      return Meteor.call("create_item", data, function() {
        var new_alert;
        $(alert).remove();
        new_alert = newAlert("Item created!", "Your item will appear momentarily.", true);
        return setTimeout((function() {
          return $(new_alert).remove();
        }), 4000);
      });
    };
    fileReaderOnLoad = function(e, name_attr) {
      var base64_encoded_data, k, v;
      base64_encoded_data = e.target.result.match(/,(.*)$/)[1];
      data_lis.push({
        name: name_attr,
        value: base64_encoded_data
      });
      all_file_input_load_status[name_attr] = true;
      for (k in all_file_input_load_status) {
        v = all_file_input_load_status[k];
        if (!v) {
          return;
        }
      }
      return submitItemCreation();
    };
    data_lis = $("#item-compose-form").serializeArray();
    all_file_input = $("input[type=file]");
    for (_i = 0, _len = all_file_input.length; _i < _len; _i++) {
      f = all_file_input[_i];
      if (f.files && f.files[0]) {
        all_file_input_load_status[$(f).attr("name")] = false;
      }
    }
    if (Object.keys(all_file_input_load_status).length === 0) {
      submitItemCreation();
    }
    _results = [];
    for (i = _j = 0, _ref = all_file_input.length - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; i = 0 <= _ref ? ++_j : --_j) {
      _results.push((function(idx) {
        var file_input, file_reader;
        file_input = all_file_input[idx];
        if (file_input.files && file_input.files[0]) {
          file_reader = new FileReader();
          file_reader.onload = function(e) {
            return fileReaderOnLoad(e, $(file_input).attr("name"));
          };
          return file_reader.readAsDataURL(file_input.files[0]);
        }
      })(i));
    }
    return _results;
  };

  Template.items.child_containers = function() {
    var container_path_lis, main_container;
    container_path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH) ? Session.get(ITEM_SESSION.MATERIALIZED_PATH) : [];
    main_container = ITMChildCategories.findOne({
      materialized_path: container_path_lis
    });
    if ((main_container == null) && container_path_lis.length !== 0) {
      return ITMChildCategories.find({}, {
        limit: 0
      });
    }
    return ITMChildCategories.find({
      parent_id: container_path_lis.length !== 0 ? main_container._id : null
    }, {
      transform: function(doc) {
        var url;
        url = suburl_to_current_path_for_items();
        doc.url = url + "/" + doc.name;
        doc.id = doc._id.valueOf();
        return doc;
      },
      sort: {
        name: 1
      }
    });
  };

  Template.items.is_root_container = function() {
    return is_materialized_path_null();
  };

  Template.items.materialized_path = function() {
    return Session.get(ITEM_SESSION.MATERIALIZED_PATH);
  };

  Template.items.view = function() {
    if (Session.get(ITEM_SESSION.VIEW_TYPE) === VIEW_TYPE.CONTAINER) {
      if (is_materialized_path_null()) {
        return Template[ITEM_TEMPLATE.SELECT_CONTAINER]();
      } else {
        return Template[ITEM_TEMPLATE.ITEMS]();
      }
    } else if (Session.get(ITEM_SESSION.VIEW_TYPE) === VIEW_TYPE.CREATE || Session.get(ITEM_SESSION.VIEW_TYPE) === VIEW_TYPE.UPDATE) {
      return Template[ITEM_TEMPLATE.COMPOSE]();
    } else if (Session.get(ITEM_SESSION.VIEW_TYPE) === VIEW_TYPE.ITEM) {
      return Template[ITEM_TEMPLATE.ITEM_VIEW]();
    }
  };

  Template.items.back_url = function() {
    var back_path_lis, path_lis, path_lis_len;
    if (Session.get(ITEM_SESSION.VIEW_TYPE) === VIEW_TYPE.ITEM) {
      return suburl_to_current_path_for_items();
    } else if (Session.get(ITEM_SESSION.VIEW_TYPE) === VIEW_TYPE.CREATE) {
      return suburl_to_current_path_for_items();
    } else {
      path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
      path_lis_len = path_lis.length;
      if (path_lis == null) {
        return "#";
      } else if (path_lis_len === 1) {
        return "/items";
      }
      back_path_lis = path_lis.splice(0, path_lis_len - 1);
      return url_from_path(back_path_lis);
    }
  };

  Template.items.events = {
    "click .new_container": function(evt) {
      return bootbox.prompt("Name of container to create?", function(container_name) {
        if (container_name == null) {
          return;
        }
        return bootbox.prompt("Description of " + container_name + "?", function(container_desc) {
          var path_lis;
          path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
          if (path_lis) {
            path_lis.push(container_name);
          } else {
            path_lis = [container_name];
          }
          return Meteor.call("put_container", path_lis, container_desc, function() {
            return init_items();
          });
        });
      });
    }
  };

  Template.items.rendered = function() {
    var pressTimer;
    scrollTop();
    pressTimer = null;
    return $(".anchor-container").mouseup((function(evt) {
      return clearTimeout(pressTimer);
    })).mousedown(function(evt) {
      return pressTimer = window.setTimeout((function() {
        evt.preventDefault();
        return bootbox.confirm("Delete container?", function(res) {
          var anchor, container_id;
          if (res) {
            anchor = $(evt.target).parent();
            container_id = $(anchor).attr("id");
            Meteor.call("del_container", container_id);
            return $(anchor).remove();
          }
        });
      }), 1000);
    });
  };

  Template.item_compose.tags_json = function() {
    var item_id, obj;
    if (Session.get(ITEM_SESSION.VIEW_TYPE) === VIEW_TYPE.UPDATE) {
      item_id = Session.get(ITEM_SESSION.ITEM_ID);
      obj = ITMItems.findOne({
        $or: [
          {
            _id: new Meteor.Collection.ObjectID(item_id)
          }, {
            _id: item_id
          }
        ]
      });
      if (obj != null) {
        Session.set(ITEM_SESSION.CUSTOM_TAGS, obj.tags);
        return JSON.stringify(obj.tags);
      }
    }
    return JSON.stringify([]);
  };

  Template.item_compose.custom_media_lis_json = function() {
    var item_id, obj;
    if (Session.get(ITEM_SESSION.VIEW_TYPE) === VIEW_TYPE.UPDATE) {
      item_id = Session.get(ITEM_SESSION.ITEM_ID);
      obj = ITMItems.findOne({
        $or: [
          {
            _id: new Meteor.Collection.ObjectID(item_id)
          }, {
            _id: item_id
          }
        ]
      });
      if (obj != null) {
        Session.set(ITEM_SESSION.CUSTOM_MEDIA, obj.custom_media_lis);
        return JSON.stringify(obj.custom_media_lis);
      }
    }
    return JSON.stringify([]);
  };

  Template.item_compose.custom_attr_lis_json = function() {
    var item_id, obj;
    if (Session.get(ITEM_SESSION.VIEW_TYPE) === VIEW_TYPE.UPDATE) {
      item_id = Session.get(ITEM_SESSION.ITEM_ID);
      obj = ITMItems.findOne({
        $or: [
          {
            _id: new Meteor.Collection.ObjectID(item_id)
          }, {
            _id: item_id
          }
        ]
      });
      if (obj != null) {
        Session.set(ITEM_SESSION.CUSTOM_ATTRS, obj.custom_attr_lis);
        return JSON.stringify(obj.custom_attr_lis);
      }
    }
    return JSON.stringify([]);
  };

  Template.item_compose.extra_attr = function() {
    var item_id, lis, obj;
    if (Session.get(ITEM_SESSION.VIEW_TYPE) === VIEW_TYPE.UPDATE) {
      lis = [];
      item_id = Session.get(ITEM_SESSION.ITEM_ID);
      obj = ITMItems.findOne({
        $or: [
          {
            _id: new Meteor.Collection.ObjectID(item_id)
          }, {
            _id: item_id
          }
        ]
      });
      if (obj != null) {
        _.each(obj.custom_attr_lis, function(attr) {
          return lis.push({
            k: attr,
            v: obj[attr]
          });
        });
        return lis;
      }
    }
    return null;
  };

  Template.item_compose.item_to_update = function() {
    var item_id;
    if (Session.get(ITEM_SESSION.VIEW_TYPE) === VIEW_TYPE.UPDATE) {
      item_id = Session.get(ITEM_SESSION.ITEM_ID);
      return ITMItems.findOne({
        $or: [
          {
            _id: new Meteor.Collection.ObjectID(item_id)
          }, {
            _id: item_id
          }
        ]
      }, {
        transform: function(doc) {
          doc.id = doc._id.valueOf();
          return doc;
        }
      });
    }
    return null;
  };

  Template.item_compose.rendered = function() {
    scrollTop();
    return $("#tagsinput_tag").keypress(function(e) {
      var custom_grp, customtagLis, random_id, val;
      if (e.which === 13) {
        e.preventDefault();
        val = $(this).val();
        if (val == null) {
          return;
        }
        customtagLis = Session.get(ITEM_SESSION.CUSTOM_TAGS) ? Session.get(ITEM_SESSION.CUSTOM_TAGS) : [];
        if (!_.contains(customtagLis, val)) {
          customtagLis.push(val);
        }
        Session.set(ITEM_SESSION.CUSTOM_TAGS, customtagLis);
        $("#custom-tag-lis").attr("value", JSON.stringify(customtagLis));
        random_id = Math.random().toString(36).substr(2, 16);
        custom_grp = $("#tag-template").clone().removeAttr("id").removeClass("hidden");
        custom_grp.find("span").text(val);
        $("#tagsinput").prepend(custom_grp);
        $(this).val("");
        return $(this).blur();
      }
    });
  };

  Template.item_compose.events = {
    'click .submit-btn': function(evt) {
      var url;
      evt.preventDefault();
      if ($("#item-compose-form").parsley("validate")) {
        createItem();
        url = suburl_to_current_path_for_items();
        Router.navigate(url, true);
      }
      return $("#custom-attr-lis").attr("value", "");
    },
    'click #add-custom-attr-btn': function(evt) {
      return bootbox.prompt("Attribute name without spaces? (Example: \"price_in_euro\")", function(attr_name) {
        var customAttrLis, custom_grp, random_id;
        if (attr_name == null) {
          return;
        }
        customAttrLis = Session.get(ITEM_SESSION.CUSTOM_ATTRS);
        if (!_.contains(customAttrLis, attr_name)) {
          customAttrLis.push(attr_name);
        }
        Session.set(ITEM_SESSION.CUSTOM_ATTRS, customAttrLis);
        $("#custom-attr-lis").attr("value", JSON.stringify(customAttrLis));
        random_id = Math.random().toString(36).substr(2, 16);
        custom_grp = $("#custom-attr-template").clone().removeAttr("id").removeClass("hidden");
        custom_grp.find("label").attr("for", random_id).text(attr_name);
        custom_grp.find("input").attr("id", random_id).attr("name", attr_name);
        return $("#custom-ctrl-grp").before(custom_grp);
      });
    },
    'click #add-custom-img-btn': function(evt) {
      return bootbox.prompt("Media attribute name without spaces? (Example: \"color\")", function(attr_name) {
        var customImgLis, custom_grp, random_id;
        if (attr_name == null) {
          return;
        }
        customImgLis = Session.get(ITEM_SESSION.CUSTOM_MEDIA);
        if (!_.contains(customImgLis, attr_name)) {
          customImgLis.push(attr_name);
        }
        Session.set(ITEM_SESSION.CUSTOM_MEDIA, customImgLis);
        $("#custom-img-lis").attr("value", JSON.stringify(customImgLis));
        random_id = Math.random().toString(36).substr(2, 16);
        custom_grp = $("#custom-img-template").clone().removeAttr("id", random_id).removeClass("hidden");
        custom_grp.find("label").attr("for", random_id).text(attr_name);
        custom_grp.find("input").attr("id", random_id).attr("name", attr_name);
        return $("#custom-ctrl-grp").before(custom_grp);
      });
    },
    'click #tagsinput_addTag': function(evt) {
      return $("#tagsinput_tag").focus();
    },
    'click .tagsinput-remove-link': function(evt) {
      return bootbox.confirm("Confirm remove tag?", function(res) {
        var customtagLis, tag_name;
        if (res != null) {
          tag_name = $(evt.target).parent().find("span").text();
          customtagLis = Session.get(ITEM_SESSION.CUSTOM_TAGS);
          customtagLis = _.without(customtagLis, tag_name);
          Session.set(ITEM_SESSION.CUSTOM_TAGS, customtagLis);
          $("#custom-tag-lis").attr("value", JSON.stringify(customtagLis));
          return $(evt.target).parent().remove();
        }
      });
    }
  };

  Template.item_compose.back_url = suburl_to_current_path_for_items();

  Template.item_compose.form_submit_url = function() {
    return BACKEND_URL + "item/";
  };

  Template.item_compose.path_lis_json = function() {
    var path_lis;
    path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
    return JSON.stringify(path_lis);
  };

  Template.item_compose.redirect_to = function() {
    var suburl;
    suburl = suburl_to_current_path_for_items();
    return PLATFORM_URL + suburl.substring(1, suburl.length);
  };

  Template.item_breadcrumb.breadcrumbs = function() {
    var array_lis, i, itm, lis, sub_lis, _i, _ref;
    lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
    array_lis = [];
    for (i = _i = 0, _ref = lis.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      itm = lis[i];
      sub_lis = lis.slice(0, i + 1);
      array_lis.push({
        name: itm,
        url: url_from_path(sub_lis)
      });
    }
    return array_lis;
  };

  Template.item_breadcrumb.active = function() {
    if (is_view_type(VIEW_TYPE.CONTAINER)) {
      return "All";
    } else if (is_view_type(VIEW_TYPE.CREATE)) {
      return "New Item";
    } else if (is_view_type(VIEW_TYPE.ITEM)) {
      return "View Item";
    }
  };

  Template.item_view.update_url = function() {
    var item_id, url;
    url = suburl_to_current_path_for_items();
    item_id = Session.get(ITEM_SESSION.ITEM_ID);
    return url + "/update/" + item_id;
  };

  Template.item_view.item = function() {
    var item_id;
    item_id = Session.get(ITEM_SESSION.ITEM_ID);
    return ITMItems.findOne({
      $or: [
        {
          _id: new Meteor.Collection.ObjectID(item_id)
        }, {
          _id: item_id
        }
      ]
    }, {
      transform: function(doc) {
        var media_obj;
        if (doc.media_id != null) {
          media_obj = ITMMedia.findOne({
            _id: doc.media_id
          });
          if (media_obj != null) {
            doc.media_url = url_for(media_obj);
          }
        }
        return doc;
      }
    });
  };

  Template.item_view.events = {
    "click #delete-item": function() {
      return bootbox.confirm("Confirm delete?", function(res) {
        var item_id, url;
        if (res) {
          item_id = Session.get(ITEM_SESSION.ITEM_ID);
          url = suburl_to_current_path_for_items();
          Meteor.call("del_item", item_id, function(error, content) {
            return Router.navigate(url, true);
          });
          return ITMItems.remove({
            _id: item_id
          });
        }
      });
    }
  };

  Template.item_container.events = {
    "click .sort_by_date": function() {
      return Session.set(ITEM_SESSION.SORT_METHOD, ITEM_SORT_METHOD.DATE_ADDED);
    },
    "click .sort_by_name": function() {
      return Session.set(ITEM_SESSION.SORT_METHOD, ITEM_SORT_METHOD.NAME);
    }
  };

  Template.item_container.rendered = function() {
    var width;
    scrollTop();
    width = $(".empty-img").width();
    $(".empty-img").height(width);
    $(".empty-img").css("line-height", width + "px");
    return _.each($(".items .item .img-holder"), function(itm) {
      return $(itm).height(width);
    });
  };

  Template.item_container.container_name = function() {
    var container_obj, path_lis;
    container_obj = Session.get(ITEM_SESSION.CONTAINER);
    if (container_obj == null) {
      path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH);
      return path_lis.pop();
    }
    return container_obj.name;
  };

  Template.item_container.desc = function() {
    return Session.get(ITEM_SESSION.CONTAINER_DESC);
  };

  Template.item_container.total_items = function() {
    var container_path_lis, main_container;
    container_path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH) ? Session.get(ITEM_SESSION.MATERIALIZED_PATH) : [];
    main_container = ITMChildCategories.findOne({
      materialized_path: container_path_lis
    });
    if (container_path_lis.length !== 0 && (main_container == null)) {
      return ITMItems.find({}, {
        limit: 0
      }).count();
    }
    return ITMItems.find({
      container_id: main_container._id
    }).count();
  };

  Template.item_container.sort_by_date = function() {
    return Session.get(ITEM_SESSION.SORT_METHOD) === ITEM_SORT_METHOD.DATE_ADDED;
  };

  Template.item_container.sort_by_name = function() {
    return Session.get(ITEM_SESSION.SORT_METHOD) === ITEM_SORT_METHOD.NAME;
  };

  Template.item_container.items = function() {
    var all_items, container_path_lis, i, item_lis, j, main_container, split_lis, sub_lis;
    container_path_lis = Session.get(ITEM_SESSION.MATERIALIZED_PATH) ? Session.get(ITEM_SESSION.MATERIALIZED_PATH) : [];
    main_container = ITMChildCategories.findOne({
      materialized_path: container_path_lis
    });
    if (container_path_lis.length !== 0 && (main_container == null)) {
      return ITMItems.find({}, {
        limit: 0
      }).count();
    }
    all_items = ITMItems.find({
      container_id: main_container._id
    }, {
      sort: {
        timestamp_utc: 1
      },
      transform: function(doc) {
        var media_obj;
        if (doc.media_id != null) {
          media_obj = ITMMedia.findOne({
            _id: doc.media_id
          });
          if (media_obj != null) {
            doc.media_url = url_for(media_obj);
          }
        }
        return doc;
      }
    }).fetch();
    item_lis = [
      {
        is_empty: true
      }
    ];
    _.each(all_items, function(itm) {
      itm.item_url = suburl_to_current_path_for_items() + "/item/" + itm._id;
      return item_lis.push(itm);
    });
    split_lis = [];
    sub_lis = {
      individual_item: []
    };
    i = 0;
    j = 5;
    _.each(item_lis, function(itm) {
      sub_lis.individual_item.push(itm);
      if (i % j === 0 && i > 0) {
        split_lis.push(sub_lis);
        sub_lis = {
          individual_item: []
        };
        j = 6;
        i = 0;
      }
      return i++;
    });
    if (sub_lis.individual_item.length > 0) {
      split_lis.push(sub_lis);
    }
    return split_lis;
  };

  Template.item_container.new_item_url = function() {
    var url;
    url = suburl_to_current_path_for_items();
    return url + "/new";
  };

  this._init_items = init_items;

}).call(this);
