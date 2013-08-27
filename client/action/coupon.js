// Generated by CoffeeScript 1.6.3
(function() {
  var ITEMS_PER_PAGE, bindCouponComposeForm, createCoupon, getCouponDurationDesc, getCouponItemScopeDesc, getCouponPage, getPageNo;

  this.COUPON_SESSION = {
    SUBURL: "CPSubUrl"
  };

  this.COUPON_TEMPLATE = {
    MAIN: "coupon_all",
    NEW: "coupon_compose"
  };

  this.COUPON_PAGE = {
    MAIN: "all",
    COMPOSE: "new"
  };

  ITEMS_PER_PAGE = 20;

  Template.coupon.rendered = function() {
    return scrollTop();
  };

  Template.coupon.view = function() {
    return Template[getCouponPage()]();
  };

  Template.coupon_all.created = function() {
    Meteor.subscribe("all_containers");
    Meteor.subscribe("all_items");
    Meteor.subscribe("all_groups");
    Meteor.subscribe("all_users");
    return Meteor.subscribe("all_coupons");
  };

  Template.coupon_all.coupons = function() {
    var page_no_0_idx;
    page_no_0_idx = getPageNo() - 1;
    return Coupon.find({}, {
      limit: ITEMS_PER_PAGE,
      skip: page_no_0_idx * ITEMS_PER_PAGE,
      sort: {
        modification_timestamp_utc: -1
      },
      transform: function(doc) {
        doc["id"] = doc._id.valueOf();
        doc["item_scope_desc"] = getCouponItemScopeDesc(doc);
        doc["has_disable_btn"] = doc.status === "available";
        doc["min_order"] = "It is only valid for orders with a minimum spending of <strong>$" + doc.order_minimum_spending + "</strong>.";
        doc["duration_desc"] = getCouponDurationDesc(doc);
        return doc;
      }
    });
  };

  Template.coupon_all.events = {
    "click .disable-coupon": function(evt) {
      var coupon_id;
      coupon_id = $(evt.target).parents("[data-expanded]").attr("data-expanded");
      Coupon.update({
        _id: new Meteor.Collection.ObjectID(coupon_id)
      }, {
        $set: {
          status: "disabled"
        }
      });
      return flashAlert("Coupon disabled.", "");
    },
    "click .enable-coupon": function(evt) {
      var coupon_id;
      coupon_id = $(evt.target).parents("[data-expanded]").attr("data-expanded");
      Coupon.update({
        _id: new Meteor.Collection.ObjectID(coupon_id)
      }, {
        $set: {
          status: "available"
        }
      });
      return flashAlert("Coupon enabled.", "");
    },
    "click .delete-coupon": function(evt) {
      return bootbox.confirm("This step is irreversible. Confirm delete coupon?", function(res) {
        var coupon_id;
        if (res) {
          coupon_id = $(evt.target).parents("[data-expanded]").attr("data-expanded");
          Coupon.remove({
            _id: new Meteor.Collection.ObjectID(coupon_id)
          });
          return flashAlert("Coupon disabled.", "");
        }
      });
    },
    "click .adjust-valid-times": function(evt) {
      return bootbox.prompt("Number of times to adjust to?", function(num) {
        var coupon_id;
        if (isNumber(num)) {
          coupon_id = $(evt.target).parents("[data-expanded]").attr("data-expanded");
          console.log(coupon_id);
          Coupon.update({
            _id: new Meteor.Collection.ObjectID(coupon_id)
          }, {
            $set: {
              valid_times: parseInt(num)
            }
          });
          return flashAlert("Coupon updated", "");
        }
      });
    }
  };

  Template.coupon_compose.created = function() {
    Meteor.subscribe("all_groups");
    Meteor.subscribe("all_users");
    return Meteor.subscribe("all_coupons");
  };

  Template.coupon_compose.rendered = function() {
    $("#coupon-compose-form").off("submit");
    bindCouponComposeForm();
    return $("#coupon-compose-form").on("submit", function(evt) {
      evt.preventDefault();
      return createCoupon();
    });
  };

  Template.coupon_compose.groups = function() {
    return Group.find({}, {
      sort: {
        name: 1
      }
    });
  };

  bindCouponComposeForm = function() {
    $("#user-applicable").off("change");
    $("#user-applicable").change(function() {
      $(".select-specific-user").addClass("hidden");
      $(".select-user-grp").addClass("hidden");
      if ($(this).val() === "group") {
        return $(".select-user-grp").removeClass("hidden");
      } else if ($(this).val() === "specific_user") {
        return $(".select-specific-user").removeClass("hidden");
      }
    });
    $("#user").off("focus");
    $("#user").focus(function() {
      var _this = this;
      return searchUserId(function(res, userid, username, email) {
        if (res) {
          $(_this).val("" + username + " " + email);
          return $(_this).attr("data-user-id", userid);
        }
      });
    });
    $("#applicable-on").off("change");
    $("#applicable-on").change(function() {
      $("#select-container").addClass("hidden");
      $("#container-id").removeAttr("data-required");
      $("#select-item").addClass("hidden");
      $("#item-id").removeAttr("data-required");
      if ($(this).val() === "item") {
        $("#select-item").removeClass("hidden");
        return $("#item-id").attr("data-required", "true");
      } else if ($(this).val() === "container") {
        $("#select-container").removeClass("hidden");
        return $("#container-id").attr("data-required", "true");
      }
    });
    $("#lifetime-type").off("change");
    $("#lifetime-type").change(function() {
      $(".date-selectors").addClass("hidden");
      if ($(this).val() === "duration") {
        return $(".date-selectors").removeClass("hidden");
      }
    });
    $(".date-selectors").datetimepicker({
      language: 'en'
    });
    $("#item-id").off("focus");
    $("#item-id").focus(function() {
      var _this = this;
      return searchItemId(function(success, id, name) {
        if (success) {
          $(_this).val(name);
          return $(_this).attr("data-item-id", id);
        }
      });
    });
    $("#container-id").off("focus");
    return $("#container-id").focus(function() {
      var _this = this;
      return searchContainerId(function(success, id, name) {
        if (success) {
          $(_this).val(name);
          return $(_this).attr("data-container-id", id);
        }
      });
    });
  };

  getCouponItemScopeDesc = function(doc) {
    var container_obj, container_repr, item_obj, item_repr;
    if (doc.coupon_scope === "item_only") {
      item_obj = getItem(doc.obj_id);
      item_repr = item_obj.container.materialized_path.join(" / ") + " / " + item_obj.name;
      return "This coupon is applicable on the item: <strong>" + item_repr + "</strong>.";
    } else if (doc.coupon_scope === "container_wide") {
      container_obj = getContainer(doc.obj_id);
      container_repr = container_obj.materialized_path.join(" / ");
      return "This coupon is applicable on the container: <strong>" + container_repr + "</strong>.";
    }
    return "This coupon is <strong>applicable on all items</strong>";
  };

  getCouponDurationDesc = function(doc) {
    var begins, begins_str, ends, ends_str;
    if (doc.discount_lifetime_type === "limited") {
      begins = moment(doc.begins_utc_datetime);
      ends = moment(doc.expire_utc_datetime);
      begins_str = begins.format('MMMM Do YYYY');
      ends_str = ends.format('MMMM Do YYYY');
      return "This coupon is valid from " + begins_str + " till " + ends_str + "<br>";
    }
    return "It is valid until you disable or delete it.<br>";
  };

  getPageNo = function() {
    var slugs;
    slugs = Session.get(COUPON_SESSION.SUBURL);
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

  getCouponPage = function() {
    var slugs;
    slugs = Session.get(COUPON_SESSION.SUBURL);
    if (slugs == null) {
      return COUPON_TEMPLATE.MAIN;
    }
    slugs = slugs.split("/");
    slugs = _.filter(slugs, function(s) {
      return s !== "";
    });
    if (slugs.length >= 1) {
      if (slugs[0] === COUPON_PAGE.COMPOSE) {
        return COUPON_TEMPLATE.NEW;
      }
    }
    return COUPON_TEMPLATE.MAIN;
  };

  createCoupon = function() {
    var container_id, coupon_code, error, item_id, user_id;
    if ($("#coupon-compose-form").parsley("validate")) {
      error = false;
      item_id = $("#item-id").attr("data-item-id");
      container_id = $("#container-id").attr("data-container-id");
      user_id = $("#user").attr("data-user-id");
      coupon_code = $.trim($("#coupon-code").val());
      if ($("#applicable-on").val() === "item" && (item_id == null)) {
        error = true;
        flashAlert("Oops", "You need to select an item to continue..");
      }
      if ($("#applicable-on").val() === "container" && (container_id == null)) {
        error = true;
        flashAlert("Oops", "You need to select a container to continue..");
      }
      if ($("#lifetime-type").val() === "duration" && ($("#begins-on").val() === "" || $("#ends-on").val() === "")) {
        error = true;
        flashAlert("Oops", "You need to select a beginning and expiry date to continue..");
      }
      if ($("#user-applicable").val() === "group" && ($("#user-groups").val() == null)) {
        error = true;
        flashAlert("Oops", "You need to select at least a user group to continue..");
      }
      if ($("#user-applicable").val() === "specific_user" && (user_id == null)) {
        error = true;
        flashAlert("Oops", "You need to select a user to continue..");
      }
      if (Coupon.findOne({
        coupon_code: coupon_code
      }) != null) {
        error = true;
        flashAlert("Oops", "Coupon code already exists, please try another coupon code...");
      }
      if (!error) {
        return Meteor.call("new_coupon", {
          name: $("#name").val(),
          description: $("#description").val(),
          applicable_on: $("#applicable-on").val(),
          item_id: item_id,
          container_id: container_id,
          coupon_type: $("#coupon-type").val(),
          amount: $("#amount").val(),
          min_spending: $("#min-spending").val(),
          lifetime_type: $("#lifetime-type").val(),
          begins_on: $("#begins-on").val(),
          ends_on: $("#ends-on").val(),
          user_applicable: $("#user-applicable").val(),
          user_groups: $("#user-groups").val(),
          user_id: user_id,
          valid_times: $("#valid-times").val(),
          coupon_code: coupon_code
        }, function() {
          return Router.navigate("/coupon", true);
        });
      }
    }
  };

}).call(this);