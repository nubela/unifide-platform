// Generated by CoffeeScript 1.6.3
(function() {
  var DEFAULT_WARNING_QUANTITY, ITEMS_PER_PAGE, WARNING_QTY_KEY, addContainerToInventory, getAllInventory, getChildContainers, getMonitorPageNo, getPage, getPageNo, getWarningItems, getWarningQty;

  this.INVENTORY_SESSION = {
    SUBURL: "INVSubUrl"
  };

  this.INVENTORY_TEMPLATE = {
    MAIN: "inventory_all",
    MONITOR: "inventory_monitor"
  };

  this.INVENTORY_PAGE = {
    MAIN: "all",
    MONITOR: "monitor"
  };

  ITEMS_PER_PAGE = 20;

  DEFAULT_WARNING_QUANTITY = 2;

  WARNING_QTY_KEY = "ecommerce_warning_quantity";

  Template.inventory.rendered = function() {
    return scrollTop();
  };

  Template.inventory.view = function() {
    return Template[getPage()]();
  };

  Template.inventory_all.created = function() {
    Meteor.subscribe("all_items");
    Meteor.subscribe("all_containers");
    return Meteor.subscribe("all_inventory");
  };

  Template.inventory_all.events = {
    "click #add-container-to-inventory": function(evt) {
      return searchContainerId(function(success, container_id, container_name) {
        if (success) {
          return addContainerToInventory(container_id, function() {
            return flashAlert("Added " + container_name + " to inventory!", "");
          });
        }
      });
    },
    "click [data-expand]": function(evt) {
      var elem, id;
      elem = $(evt.target).parents("[data-expand]")[0];
      id = $(elem).attr("data-expand");
      $("[data-expanded]").addClass("hidden");
      return $("[data-expanded=" + id + "]").removeClass("hidden");
    },
    "click .delete-btn": function(evt) {
      var inventory_id;
      inventory_id = $(evt.target).parents("[data-expanded]").attr("data-expanded");
      return bootbox.confirm("Confirm remove?", function(res) {
        if (res) {
          return Inventory.remove({
            _id: new Meteor.Collection.ObjectID(inventory_id)
          });
        }
      });
    }
  };

  Template.inventory_all.inventory = function() {
    return getAllInventory();
  };

  Template.inventory_all.has_inventory = function() {
    return getAllInventory().fetch().length > 0;
  };

  Template.inventory_all.current_page = function() {
    return getPageNo();
  };

  Template.inventory_all.next_page_url = function() {
    var next_page, page_no;
    page_no = getPageNo();
    next_page = page_no + 1;
    return "/inventory/" + next_page;
  };

  Template.inventory_all.prev_page_url = function() {
    var page_no, prev_page;
    page_no = getPageNo();
    prev_page = page_no - 1;
    return "/inventory/" + prev_page;
  };

  Template.inventory_all.has_next = function() {
    var total_items, total_pages;
    total_items = Inventory.find({}).count();
    total_pages = Math.ceil(total_items / ITEMS_PER_PAGE);
    return getPageNo() < total_pages;
  };

  Template.inventory_all.has_prev = function() {
    return getPageNo() >= 2;
  };

  Template.inventory_monitor.created = function() {
    Meteor.subscribe("all_items");
    Meteor.subscribe("all_containers");
    return Meteor.subscribe("all_inventory");
  };

  Template.inventory_monitor.events = {
    "click #change-warning-qty-btn": function(evt) {
      return bootbox.prompt("Alert you when item quantity is equal or below..", function(res) {
        if (isNumber(res)) {
          return setProfileSettings(WARNING_QTY_KEY, parseInt(res));
        }
      });
    },
    "click [data-expand]": function(evt) {
      var elem, id;
      elem = $(evt.target).parents("[data-expand]")[0];
      id = $(elem).attr("data-expand");
      $("[data-expanded]").addClass("hidden");
      return $("[data-expanded=" + id + "]").removeClass("hidden");
    }
  };

  Template.inventory_monitor.has_warning_items = function() {
    return getWarningItems().length > 0;
  };

  Template.inventory_monitor.warning_items = function() {
    return getWarningItems();
  };

  Template.inventory_monitor.warning_qtn = function() {
    return getWarningQty();
  };

  getWarningItems = function() {
    var all_containers, all_inventory, all_items, c, child_container_ids, child_containers, container, i, warned_items, warning_qty, _i, _j, _k, _len, _len1, _len2;
    all_inventory = Inventory.find({}).fetch();
    all_containers = [];
    for (_i = 0, _len = all_inventory.length; _i < _len; _i++) {
      i = all_inventory[_i];
      container = ITMChildCategories.findOne({
        _id: i.container_id
      });
      if (container != null) {
        child_containers = getChildContainers(container);
        for (_j = 0, _len1 = child_containers.length; _j < _len1; _j++) {
          c = child_containers[_j];
          all_containers.push(c);
        }
      }
    }
    child_container_ids = _.map(all_containers, function(c) {
      return c._id;
    });
    if (child_container_ids.length === 0) {
      return [];
    }
    all_items = ITMItems.find({
      container_id: {
        $in: child_container_ids
      }
    }, {
      transform: function(doc) {
        doc.container = ITMChildCategories.findOne({
          _id: doc.container_id
        });
        doc.container_path = doc.container.materialized_path.join(" / ");
        doc["id"] = doc._id.valueOf();
        doc.view_url = "/items/" + (doc.container.materialized_path.join("/")) + "/item/" + doc.id;
        doc.update_url = "/items/" + (doc.container.materialized_path.join("/")) + "/update/" + doc.id;
        return doc;
      }
    });
    all_items = all_items.fetch();
    warning_qty = getWarningQty();
    warned_items = [];
    for (_k = 0, _len2 = all_items.length; _k < _len2; _k++) {
      i = all_items[_k];
      if ("quantity" in i && isNumber(i.quantity) && parseInt(i.quantity) <= warning_qty) {
        warned_items.push(i);
      }
    }
    return warned_items;
  };

  getWarningQty = function() {
    if (getProfileSettings(WARNING_QTY_KEY)) {
      return getProfileSettings(WARNING_QTY_KEY);
    } else {
      return DEFAULT_WARNING_QUANTITY;
    }
  };

  getAllInventory = function() {
    var page_no_0_idx;
    page_no_0_idx = getPageNo() - 1;
    return Inventory.find({}, {
      limit: ITEMS_PER_PAGE,
      skip: page_no_0_idx * ITEMS_PER_PAGE,
      sort: {
        modification_timestamp_utc: -1
      },
      transform: function(doc) {
        var all_child_containers, all_items, child_container_ids;
        doc["id"] = doc._id.valueOf();
        doc["container"] = ITMChildCategories.findOne({
          _id: doc.container_id
        });
        doc["container_full_path"] = doc.container.materialized_path.join(" / ");
        all_child_containers = getChildContainers(doc.container);
        child_container_ids = _.map(all_child_containers, function(c) {
          return c._id;
        });
        all_items = ITMItems.find({
          container_id: {
            $in: child_container_ids
          }
        });
        doc["item_count"] = all_items.count();
        return doc;
      }
    });
  };

  getChildContainers = function(container) {
    var all_children, all_containers, all_res, cr, r, res, _i, _j, _len, _len1;
    all_containers = [container];
    res = ITMChildCategories.find({
      parent_id: container._id
    });
    all_res = res.fetch();
    for (_i = 0, _len = all_res.length; _i < _len; _i++) {
      r = all_res[_i];
      all_children = getChildContainers(r);
      for (_j = 0, _len1 = all_children.length; _j < _len1; _j++) {
        cr = all_children[_j];
        all_containers.push(cr);
      }
    }
    return all_containers;
  };

  getPageNo = function() {
    var slugs;
    slugs = Session.get(INVENTORY_SESSION.SUBURL);
    if (slugs == null) {
      return 1;
    }
    slugs = slugs.split("/");
    slugs = _.filter(slugs, function(s) {
      return s !== "";
    });
    if (slugs.length >= 1) {
      return parseInt(slugs[0]);
    }
    return 1;
  };

  getMonitorPageNo = function() {
    var slugs;
    slugs = Session.get(INVENTORY_SESSION.SUBURL);
    if (slugs == null) {
      return 1;
    }
    slugs = slugs.split("/");
    slugs = _.filter(slugs, function(s) {
      return s !== "";
    });
    if (slugs.length >= 2) {
      return parseInt(slugs[1]);
    }
    return 1;
  };

  getPage = function() {
    var slugs;
    slugs = Session.get(INVENTORY_SESSION.SUBURL);
    if (slugs == null) {
      return INVENTORY_TEMPLATE.MAIN;
    }
    slugs = slugs.split("/");
    slugs = _.filter(slugs, function(s) {
      return s !== "";
    });
    if (slugs.length >= 1) {
      if (slugs[0] === INVENTORY_PAGE.COMPOSE) {
        return INVENTORY_TEMPLATE.NEW;
      } else if (slugs[0] === INVENTORY_PAGE.MONITOR) {
        return INVENTORY_TEMPLATE.MONITOR;
      }
    }
    return INVENTORY_TEMPLATE.MAIN;
  };

  addContainerToInventory = function(container_id, cb) {
    return Meteor.call("new_inventory_container", container_id, cb);
  };

}).call(this);
