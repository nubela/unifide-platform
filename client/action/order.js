// Generated by CoffeeScript 1.6.2
(function() {
  var ORDERS_PAGE_PAGE, capitaliseFirstLetter, cursorFilter, cursurOpt, isFilter;

  this.ORDER_VIEW = {
    UPDATE: "order_view_update",
    OVERVIEW: "order_view_overview",
    DETAILS: "order_view_details",
    DETAILS_FILTERED: "order_view_details_filtered"
  };

  this.ORDER_SESSION = {
    OBJ_ID: "order_obj_id",
    VIEW_TYPE: "order_view_type",
    PAGE_NO: "order_page_no"
  };

  this.ORDER_TEMPLATE = {
    OVERVIEW: "order_table",
    UPDATE: "order_update",
    DETAILS: "order_details"
  };

  ORDERS_PAGE_PAGE = 10;

  Template.order.view = function() {
    if ((Session.get(ORDER_SESSION.VIEW_TYPE)) === ORDER_VIEW.UPDATE) {
      return Template[ORDER_TEMPLATE.UPDATE]();
    } else if ((Session.get(ORDER_SESSION.VIEW_TYPE)) === ORDER_VIEW.DETAILS) {
      return Template[ORDER_TEMPLATE.DETAILS]();
    } else {
      return Template[ORDER_TEMPLATE.OVERVIEW]();
    }
  };

  Template.order_table.has_orders = function() {
    return ORDERObj.find(cursorFilter()).count() > 0;
  };

  Template.order_table.has_orders = function() {
    return ORDERObj.find(cursorFilter()).count() > 0;
  };

  Template.order_table.total_orders = function() {
    return ORDERObj.find(cursorFilter()).count();
  };

  Template.order_table.current_orders = function() {
    return (parseInt(Session.get(ORDER_SESSION.PAGE_NO)) - 1) * ORDERS_PAGE_PAGE;
  };

  Template.order_table.max_orders = function() {
    var l, skip;

    skip = (parseInt(Session.get(ORDER_SESSION.PAGE_NO)) - 1) * ORDERS_PAGE_PAGE;
    l = ORDERObj.find(cursorFilter(), {
      limit: ORDERS_PAGE_PAGE
    }).fetch().length;
    return skip + l;
  };

  Template.order_table.has_pagination = function() {
    return ORDERObj.find(cursorFilter(), {
      limit: ORDERS_PAGE_PAGE
    }).fetch().length < ORDERObj.find(cursorFilter()).count();
  };

  Template.order_table.is_filtered = function() {
    return isFilter();
  };

  Template.order_table.filtered_item_name = function() {
    var item;

    item = ORDERObj.findOne(cursorFilter());
    console.log(item);
    return item.object.name;
  };

  Template.order_table.pagination = function() {
    var current_page, dic, has_next, has_prev, next_page, obj_id, pages, prev_page, total_pages;

    total_pages = ORDERObj.find(cursorFilter()).count() / ORDERS_PAGE_PAGE;
    pages = [];
    current_page = parseInt(Session.get(ORDER_SESSION.PAGE_NO));
    next_page = current_page + 1;
    prev_page = current_page - 1;
    has_next = current_page < total_pages;
    has_prev = current_page > 1;
    obj_id = Session.get(ORDER_SESSION.OBJ_ID);
    _.each(_.range(1, total_pages + 1), function(page_no) {
      return pages.push({
        url: "/",
        page_no: page_no,
        is_active: (parseInt(Session.get(ORDER_SESSION.PAGE_NO))) === page_no
      });
    });
    dic = {
      next: {
        has: has_next,
        url: "/order/filtered/" + obj_id + "/page/" + next_page
      },
      prev: {
        has: has_prev,
        url: "/order/filtered/" + obj_id + "/page/" + prev_page
      },
      pages: pages
    };
    return dic;
  };

  Template.order_table.orders = function() {
    var formatted_lis, orders;

    orders = ORDERObj.find(cursorFilter(), cursurOpt()).fetch();
    formatted_lis = [];
    _.each(orders, function(order) {
      return formatted_lis.push({
        id: order._id,
        date: capitaliseFirstLetter(humanize.naturalDay(order.timestamp_utc)),
        user_name: order.user.first_name + " " + order.user.last_name,
        item_name: order.object.name,
        obj_id: order.obj_id
      });
    });
    return formatted_lis;
  };

  Template.order_table.rendered = function() {
    return $(".order-action").tooltip({
      placement: "top"
    });
  };

  Template.order_table.events = {
    "mouseenter .order-entry": function(evt) {
      var order_action, target;

      target = evt.target;
      order_action = $(target).find(".order-action");
      return _.each(order_action, function(anchor) {
        $(anchor).removeClass("btn-disabled");
        return $(anchor).addClass("btn-primary");
      });
    },
    "mouseleave .order-entry": function(evt) {
      var order_action, target;

      target = evt.target;
      order_action = $(target).find(".order-action");
      return _.each(order_action, function(anchor) {
        $(anchor).removeClass("btn-primary");
        return $(anchor).addClass("btn-disabled");
      });
    }
  };

  capitaliseFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + (string.slice(1));
  };

  isFilter = function() {
    return (Session.get(ORDER_SESSION.OBJ_ID)) !== "null" && (Session.get(ORDER_SESSION.OBJ_ID)) !== null;
  };

  cursorFilter = function() {
    var dic;

    if ((Session.get(ORDER_SESSION.OBJ_ID)) !== "null" && (Session.get(ORDER_SESSION.OBJ_ID)) !== null) {
      dic = {
        obj_id: Session.get(ORDER_SESSION.OBJ_ID)
      };
    } else {
      dic = {};
    }
    return dic;
  };

  cursurOpt = function() {
    return {
      limit: ORDERS_PAGE_PAGE,
      skip: (parseInt(Session.get(ORDER_SESSION.PAGE_NO)) - 1) * ORDERS_PAGE_PAGE
    };
  };

  this.reset_orders = function() {
    Session.set(ORDER_SESSION.PAGE_NO, 1);
    Session.set(ORDER_SESSION.OBJ_ID, null);
    return Session.set(ORDER_SESSION.VIEW_TYPE, ORDER_VIEW.OVERVIEW);
  };

  this.init_orders = function() {
    return Meteor.call("get_all_orders", function(error, content) {
      return _.each(content.orders, function(order) {
        return ORDERObj.insert(order);
      });
    });
  };

}).call(this);
