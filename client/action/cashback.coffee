@CASHBACK_SESSION =
    SUBURL: "CBSubUrl"

@CASHBACK_TEMPLATE =
    MAIN: "cashback_rules"
    COMPOSE_RULE: "cashback_compose"
    TRANSACTION_LOG: "cashback_transaction_log"
    USER_CREDIT_STORE: "cashback_user_values"

#-- cashback --#

Template.cashback.view = ->
    Template[CASHBACK_TEMPLATE.MAIN]()

Template.cashback.rendered = ->
    scrollTop()