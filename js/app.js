var App = Ember.Application.create();

App.ApplicationController = Ember.Controller.extend();
App.ApplicationView = Ember.View.extend({
  templateName: 'application'
});

App.AllSpacesController = Ember.ArrayController.extend();
App.AllSpacesView = Ember.View.extend({
  templateName: 'spaces'
})

App.ParkingSpace = Ember.Object.extend({
  name: function() {
    return (/^(P\dA?)/).exec(this.subzonename)[1]
  }.property("subzonename"),

  type: function() {
    var type = (/^\w+\s(.+)\s\-/).exec(this.subzonename)[1]

    if (type == "Ovals") {
      type = (/\-\s(.+)$/).exec(this.subzonename)[1]
    }

    return type
  }.property("subzonename"),

  location: function() {
    var location = (/\-\s(.+)$/).exec(this.subzonename)[1]

    if (location == "Ticket" || location == "Permit") {
      location = "Oval"
    }

    return location
  }.property("subzonename"),

  freeSpaces: function() {
    return parseInt(this.display, 10) || 0
  }.property("display"),

  countClass: function() {
    var spaces = this.get("freeSpaces")
    if (spaces > 50) {
      return "count-positive"
    } else if (spaces > 10) {
      return "count"
    } else {
      return "count-negative"
    }
  }.property("freeSpaces"),

  isTicketType: function() {
    return this.get("type") == "Ticket"
  }.property("type")
})

App.ParkingSpace.reopenClass({
  allParkingSpaces: [],

  find: function(type) {
    this.allParkingSpaces = []
    $.ajax({
      url: "http://www.uow.edu.au/cgi-bin/parking/free-spaces?json=1",
      context: this,
      datatype: "json",
      success: function(response) {
        $.parseJSON(response).forEach(function(space){
          space = App.ParkingSpace.create(space)
          if (space.get("type") == type) {
            this.allParkingSpaces.addObject(space)
          }
        }, this)
      }
    })
    return this.allParkingSpaces
  }
})

App.Router = Ember.Router.extend({
  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/',

    showTicketParks: function (router) {
      router.get('applicationController').connectOutlet('allSpaces', App.ParkingSpace.find("Ticket"))
      $('.permit.tab-item').removeClass('active')
      $('.ticket.tab-item').addClass('active')
    },

    showPermitParks: function (router) {
      router.get('applicationController').connectOutlet('allSpaces', App.ParkingSpace.find("Permit"))
      $('.ticket.tab-item').removeClass('active')
      $('.permit.tab-item').addClass('active')
    },

      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('allSpaces', App.ParkingSpace.find("Ticket"))
      }
    })
  })
})

App.initialize();