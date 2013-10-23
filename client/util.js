// Generated by IcedCoffeeScript 1.6.3-g
(function() {


  this.MediaStorage = {
    S3: "s3",
    LOCAL: "local"
  };

  this.url_for = function(media_obj) {
    "Returns the backend url for a media object";
    if (media_obj.storage === MediaStorage.S3) {
      return media_obj.url;
    }
    return "" + BACKEND_URL + UPLOAD_RELATIVE_ENDPOINT + "/" + media_obj.file_name;
  };

  this.page_render = function(obj) {
    $(obj.firstNode).css({
      'opacity': 0
    });
    $(obj.firstNode).css({
      'position': 'relative',
      'left': 100
    });
    return $(obj.firstNode).animate({
      'opacity': 1,
      'left': '0'
    }, 100);
  };

  this.scrollTop = function() {
    return $("html, body").animate({
      scrollTop: 0
    }, "fast");
  };

  this.newAlert = function(title, description, dismissable) {
    var alert;
    if (dismissable == null) {
      dismissable = true;
    }
    alert = $(".alert-sample").clone().removeClass("hidden").removeClass("alert-sample");
    if (!dismissable) {
      $(alert).find(".container-alert-close").remove();
    } else {
      $(alert).find(".loading-gif").remove();
    }
    $(alert).find(".alert-title").text(title);
    $(alert).find(".alert-desc").text(description);
    $(".alert-container").prepend(alert);
    return alert;
  };

  this.flashAlert = function(title, description, dismissable) {
    var new_alert;
    if (dismissable == null) {
      dismissable = true;
    }
    new_alert = newAlert(title, description, dismissable);
    return setTimeout((function() {
      return $(new_alert).remove();
    }), 4000);
  };

  this.getContainer = function(container_id) {

    /*
    Returns the container of the item
    Requisites: all_containers must be subscribed
    */
    return ITMChildCategories.findOne({
      _id: container_id
    });
  };

  this.getItem = function(item_id) {

    /*
    Returns the item_obj and container object of the item
    Requisites: all_containers and all_items must be subscribed
    */
    var item_obj;
    item_obj = ITMItems.findOne({
      _id: item_id
    });
    console.log(item_id);
    item_obj.container = getContainer(item_obj.container_id);
    return item_obj;
  };

  this.isNumber = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  this.getProfileSettings = function(key) {
    var user;
    user = Meteor.user();
    if ("profile" in user) {
      return user.profile[key];
    }
    return null;
  };

  this.setProfileSettings = function(key, value) {
    var set_dic;
    set_dic = {};
    set_dic["profile." + key] = value;
    return Meteor.users.update({
      _id: Meteor.userId()
    }, {
      $set: set_dic
    });
  };

}).call(this);
