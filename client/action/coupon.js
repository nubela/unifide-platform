// Generated by CoffeeScript 1.6.3
(function() {
  var getCouponPage;

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

  Template.coupon.rendered = function() {
    return scrollTop();
  };

  Template.coupon.view = function() {
    return Template[getCouponPage()]();
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

}).call(this);
