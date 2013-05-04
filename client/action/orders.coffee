ORDERS_TEMPLATE =
    TABLE: "orders_table"

Template.orders.view = ->
    Template[ORDERS_TEMPLATE.TABLE]()