// Generated by CoffeeScript 1.6.2
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