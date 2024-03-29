// Generated by IcedCoffeeScript 1.6.3-g
(function() {
  var BIZINFO_TEMPLATE;



  BIZINFO_TEMPLATE = {
    OVERVIEW: "bizinfo_overview",
    UPDATE: "bizinfo_update"
  };

  Template.bizinfo.view = function() {
    if ((Session.get("page_template")) === BIZINFO_TEMPLATE.UPDATE) {
      return Template[BIZINFO_TEMPLATE.UPDATE]();
    } else {
      return Template[BIZINFO_TEMPLATE.OVERVIEW]();
    }
  };

  Template.bizinfo_overview.info = function() {
    return BIZINFObj.findOne();
  };

  Template.bizinfo_update.info = function() {
    return BIZINFObj.findOne();
  };

  Template.bizinfo_update.redirect_url = function() {
    var url;
    url = PLATFORM_URL;
    return "" + url + "bizinfo";
  };

  Template.bizinfo_update.user_id = function() {
    return Meteor.userId();
  };

  Template.bizinfo_update.brand_name = function() {
    return Session.get("selected_brand");
  };

  Template.bizinfo_update.submit_url = function() {
    var url;
    url = BACKEND_URL;
    return "" + url + "business/info/";
  };

  Template.bizinfo_update.events = {
    "click #bizinfo-submit-btn": function(evt) {
      evt.preventDefault();
      if ($("#bizinfo-update-form").parsley("validate")) {
        return $("#bizinfo-update-form").submit();
      }
    }
  };

}).call(this);
