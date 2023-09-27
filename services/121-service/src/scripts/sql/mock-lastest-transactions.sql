INSERT INTO "121-service"."latest_transaction" ("payment", "registrationId", "transactionId")
SELECT t.payment, t."registrationId", t.id AS transactionId
FROM (
    SELECT payment, "registrationId", MAX(created) AS max_created
    FROM "121-service"."transaction"
    WHERE status = 'success'
    GROUP BY payment, "registrationId"
) AS latest_transactions
INNER JOIN "121-service"."transaction" AS t
    ON t.payment = latest_transactions.payment
    AND t."registrationId" = latest_transactions."registrationId"
    AND t.created = latest_transactions.max_created;`
