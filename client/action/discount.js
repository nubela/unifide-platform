// Generated by CoffeeScript 1.6.3
(function() {
  var getDiscountPage;

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

  Template.discount.rendered = function() {
    return scrollTop();
  };

  Template.discount.view = function() {
    return Template[getDiscountPage()]();
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

}).call(this);
