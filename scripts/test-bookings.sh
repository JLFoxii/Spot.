#!/bin/bash

BASE_URL="http://localhost:3000/api/v1/bookings"

# IDs de test
BUSINESS_ID="13db3a1f-b6a6-4ab5-92d9-c0e0b2dc90db"
STAFF_ID="32c75400-52e5-4718-a907-a77a06ba6d86"
SERVICE_ID="d8a637fb-5f68-4a6e-8d30-86eb18bc51f2"
CLIENT_ID="dfb19b79-93d5-479c-b2b0-a30e06be497c"

echo "========================================="
echo " TEST 1: Création d'une réservation (SUCCÈS)"
echo "========================================="
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"businessId\": \"$BUSINESS_ID\",
    \"staffId\": \"$STAFF_ID\",
    \"serviceId\": \"$SERVICE_ID\",
    \"clientId\": \"$CLIENT_ID\",
    \"startAt\": \"2026-02-09T10:00:00.000Z\"
  }" | python3 -m json.tool
echo -e "\n"

echo "========================================="
echo " TEST 2: Collision exacte (ERREUR 409)"
echo "========================================="
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"businessId\": \"$BUSINESS_ID\",
    \"staffId\": \"$STAFF_ID\",
    \"serviceId\": \"$SERVICE_ID\",
    \"clientId\": \"$CLIENT_ID\",
    \"startAt\": \"2026-02-09T10:00:00.000Z\"
  }" | python3 -m json.tool
echo -e "\n"

echo "========================================="
echo " TEST 3: Chevauchement partiel à 10:15 (ERREUR 409)"
echo "========================================="
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"businessId\": \"$BUSINESS_ID\",
    \"staffId\": \"$STAFF_ID\",
    \"serviceId\": \"$SERVICE_ID\",
    \"clientId\": \"$CLIENT_ID\",
    \"startAt\": \"2026-02-09T10:15:00.000Z\"
  }" | python3 -m json.tool
echo -e "\n"

echo "========================================="
echo " TEST 4: Réservation après à 10:30 (SUCCÈS)"
echo "========================================="
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"businessId\": \"$BUSINESS_ID\",
    \"staffId\": \"$STAFF_ID\",
    \"serviceId\": \"$SERVICE_ID\",
    \"clientId\": \"$CLIENT_ID\",
    \"startAt\": \"2026-02-09T10:30:00.000Z\"
  }" | python3 -m json.tool
echo -e "\n"
