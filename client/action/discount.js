// Generated by IcedCoffeeScript 1.6.3-g
(function() {
  var IS_DISCOUNT_CREATING, ITEMS_PER_PAGE, bindFormElements, createDiscount, getDiscountDurationDesc, getDiscountItemScopeDesc, getDiscountPage, getDiscountPageNo;



  this.DISCOUNT_SESSION = {
    SUBURL: "DCSubUrl"
  };

  this.DISCOUNT_TEMPLATE = {
    MAIN: "discount_all",
    NEW: "discount_compose"
  };

  this.DISCOUNT_PAGE = {
    MAIN: "all",
    COMPOSE: "new"
  };

  IS_DISCOUNT_CREATING = false;

  ITEMS_PER_PAGE = 20;

  Template.discount.rendered = function() {
    return scrollTop();
  };

  Template.discount.view = function() {
    return Template[getDiscountPage()]();
  };

  Template.discount_all.rendered = function() {
    Meteor.subscribe("all_containers");
    Meteor.subscribe("all_items");
    Meteor.subscribe("all_discounts");
    return null;
  };

  Template.discount_all.events = {
    "click [data-expand]": function(evt) {
      var elem, id;
      elem = $(evt.target).parents("[data-expand]")[0];
      id = $(elem).attr("data-expand");
      $("[data-expanded]").addClass("hidden");
      return $("[data-expanded=" + id + "]").removeClass("hidden");
    },
    "click #enable-discount": function(evt) {
      var elem, id;
      elem = $(evt.target).parents("[data-expanded]")[0];
      id = $(elem).attr("data-expanded");
      Discount.update({
        _id: new Meteor.Collection.ObjectID(id)
      }, {
        $set: {
          status: "enabled"
        }
      });
      return flashAlert("Discount enabled", "");
    },
    "click #disable-discount": function(evt) {
      var elem, id;
      elem = $(evt.target).parents("[data-expanded]")[0];
      id = $(elem).attr("data-expanded");
      return bootbox.confirm("Confirm disable this discount?", function(res) {
        if (res) {
          Discount.update({
            _id: new Meteor.Collection.ObjectID(id)
          }, {
            $set: {
              status: "disabled"
            }
          });
          return flashAlert("Discount disabled", "");
        }
      });
    },
    "click #delete-discount": function(evt) {
      var elem, id;
      elem = $(evt.target).parents("[data-expanded]")[0];
      id = $(elem).attr("data-expanded");
      return bootbox.confirm("This step is irreversible. Confirm to delete this discount?", function(res) {
        if (res) {
          Discount.remove({
            _id: new Meteor.Collection.ObjectID(id)
          });
          return flashAlert("Discount deleted", "");
        }
      });
    },
    "click #update-discount": function(evt) {
      var elem, id;
      elem = $(evt.target).parents("[data-expanded]")[0];
      return id = $(elem).attr("data-expanded");
    }
  };

  Template.discount_all.current_page = function() {
    return getDiscountPageNo();
  };

  Template.discount_all.next_page_url = function() {
    var next_page, page_no;
    page_no = getDiscountPageNo();
    next_page = page_no + 1;
    return "/discount/" + next_page;
  };

  Template.discount_all.prev_page_url = function() {
    var page_no, prev_page;
    page_no = getDiscountPageNo();
    prev_page = page_no - 1;
    return "/discount/" + prev_page;
  };

  Template.discount_all.has_next = function() {
    var total_items, total_pages;
    total_items = Discount.find({}).count();
    total_pages = Math.ceil(total_items / ITEMS_PER_PAGE);
    return getDiscountPageNo() < total_pages;
  };

  Template.discount_all.has_prev = function() {
    return getDiscountPageNo() >= 2;
  };

  Template.discount_all.discounts = function() {
    var page_no_0_idx;
    page_no_0_idx = getDiscountPageNo() - 1;
    return Discount.find({}, {
      limit: ITEMS_PER_PAGE,
      skip: page_no_0_idx * ITEMS_PER_PAGE,
      sort: {
        modification_timestamp_utc: -1
      },
      transform: function(doc) {
        doc["id"] = doc._id.valueOf();
        doc["item_scope_desc"] = getDiscountItemScopeDesc(doc);
        doc["duration_desc"] = getDiscountDurationDesc(doc);
        doc["min_order"] = "It is only valid for orders with a minimum spending of <strong>$" + doc.order_minimum_spending + "</strong>.";
        doc["has_disable_btn"] = doc.status === "enabled";
        doc["has_enable_btn"] = doc.status === "disabled";
        console.log(doc);
        return doc;
      }
    });
  };

  Template.discount_compose.rendered = function() {
    bindFormElements();
    return $("#discount-compose-form").submit(function(evt) {
      evt.preventDefault();
      return createDiscount();
    });
  };

  Template.discount_compose.events = {
    "click #save-discount-btn": function() {
      return $("#discount-compose-form").submit();
    }
  };

  getDiscountPageNo = function() {
    var slugs;
    slugs = Session.get(DISCOUNT_SESSION.SUBURL);
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

  getDiscountPage = function() {
    var slugs;
    slugs = Session.get(DISCOUNT_SESSION.SUBURL);
    if (slugs == null) {
      return DISCOUNT_TEMPLATE.MAIN;
    }
    slugs = slugs.split("/");
    slugs = _.filter(slugs, function(s) {
      return s !== "";
    });
    if (slugs.length >= 1) {
      if (slugs[0] === DISCOUNT_PAGE.COMPOSE) {
        return DISCOUNT_TEMPLATE.NEW;
      }
    }
    return DISCOUNT_TEMPLATE.MAIN;
  };

  bindFormElements = function() {
    $("#applicable-on").change(function() {
      $("#discount-select-container").addClass("hidden");
      $("#discount-container-id").removeAttr("data-required");
      $("#discount-select-item").addClass("hidden");
      $("#discount-item-id").removeAttr("data-required");
      if ($(this).val() === "item") {
        $("#discount-select-item").removeClass("hidden");
        return $("#discount-item-id").attr("data-required", "true");
      } else if ($(this).val() === "container") {
        $("#discount-select-container").removeClass("hidden");
        return $("#discount-container-id").attr("data-required", "true");
      }
    });
    $("#discount-lifetime-type").change(function() {
      $(".date-selectors").addClass("hidden");
      if ($(this).val() === "duration") {
        return $(".date-selectors").removeClass("hidden");
      }
    });
    $(".date-selectors").datetimepicker({
      language: 'en'
    });
    $("#discount-item-id").focus(function() {
      var _this = this;
      return searchItemId(function(success, id, name) {
        if (success) {
          $(_this).val(name);
          return $(_this).attr("data-item-id", id);
        }
      });
    });
    return $("#discount-container-id").focus(function() {
      var _this = this;
      return searchContainerId(function(success, id, name) {
        if (success) {
          $(_this).val(name);
          return $(_this).attr("data-container-id", id);
        }
      });
    });
  };

  createDiscount = function() {
    if ($("#discount-compose-form").parsley("validate")) {
      if (!IS_DISCOUNT_CREATING) {
        IS_DISCOUNT_CREATING = true;
        return Meteor.call("new_discount", {
          name: $.trim($("#discount-name").val()),
          description: $.trim($("#description").val()),
          applicable_on: $("#applicable-on").val(),
          item_id: $("#discount-item-id").attr("data-item-id"),
          container_id: $("#discount-container-id").attr("data-container-id"),
          discount_type: $("#discount-type").val(),
          amount: $("#amount").val(),
          min_order: $("#min-spending").val(),
          duration: $("#discount-lifetime-type").val(),
          begins_on: $("#begins-on").val(),
          ends_on: $("#ends-on").val()
        }, function() {
          IS_DISCOUNT_CREATING = false;
          Router.navigate("/discount", true);
          return flashAlert("Discount is created!", "Your discount item will appear momentarily.");
        });
      }
    }
  };

  getDiscountItemScopeDesc = function(doc) {
    var container_obj, container_repr, item_obj, item_repr;
    if (doc.discount_scope === "item_only") {
      item_obj = getItem(doc.obj_id);
      item_repr = item_obj.container.materialized_path.join(" / ") + " / " + item_obj.name;
      return "This discount is applicable on the item: <strong>" + item_repr + "</strong>.<br>";
    } else if (doc.discount_scope === "container_wide") {
      container_obj = getContainer(doc.obj_id);
      container_repr = container_obj.materialized_path.join(" / ");
      return "This discount is applicable on the container: <strong>" + container_repr + "</strong>.<br>";
    }
    return "This discount is <strong>applicable on all items</strong><br>";
  };

  getDiscountDurationDesc = function(doc) {
    var begins, begins_str, ends, ends_str;
    if (doc.discount_lifetime_type === "limited") {
      begins = moment(doc.begins_utc_datetime);
      ends = moment(doc.expire_utc_datetime);
      begins_str = begins.format('MMMM Do YYYY');
      ends_str = ends.format('MMMM Do YYYY');
      return "This discount is valid from " + begins_str + " till " + ends_str + "<br>";
    }
    return "It is valid until you disable or delete it.<br>";
  };

}).call(this);
