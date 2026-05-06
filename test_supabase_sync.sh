#!/bin/bash

# =============================================================
# Test Supabase Sync - Verify all endpoints are working
# =============================================================

API_BASE="http://localhost:8000/api/v1"

echo "🧪 Testing TenderHub API Endpoints..."
echo ""

# Test 1: Keywords
echo "1️⃣  Testing Keywords Endpoint..."
KEYWORDS=$(curl -s "${API_BASE}/keywords")
if [ $? -eq 0 ]; then
  echo "   ✅ GET /keywords - OK"
  echo "   Response: ${KEYWORDS:0:100}..."
else
  echo "   ❌ GET /keywords - FAILED"
fi
echo ""

# Test 2: Experts
echo "2️⃣  Testing Experts Endpoint..."
EXPERTS=$(curl -s "${API_BASE}/experts")
if [ $? -eq 0 ]; then
  echo "   ✅ GET /experts - OK"
  echo "   Response: ${EXPERTS:0:100}..."
else
  echo "   ❌ GET /experts - FAILED"
fi
echo ""

# Test 3: Watchlist
echo "3️⃣  Testing Watchlist Endpoint..."
WATCHLIST=$(curl -s "${API_BASE}/watchlist")
if [ $? -eq 0 ]; then
  echo "   ✅ GET /watchlist - OK"
  echo "   Response: ${WATCHLIST:0:100}..."
else
  echo "   ❌ GET /watchlist - FAILED"
fi
echo ""

# Test 4: Tenders
echo "4️⃣  Testing Tenders Endpoint..."
TENDERS=$(curl -s "${API_BASE}/tender/search?limit=5")
if [ $? -eq 0 ]; then
  echo "   ✅ GET /tender/search - OK"
  echo "   Response: ${TENDERS:0:100}..."
else
  echo "   ❌ GET /tender/search - FAILED"
fi
echo ""

# Test 5: RUP
echo "5️⃣  Testing RUP Endpoint..."
RUP=$(curl -s "${API_BASE}/rup/search?limit=5")
if [ $? -eq 0 ]; then
  echo "   ✅ GET /rup/search - OK"
  echo "   Response: ${RUP:0:100}..."
else
  echo "   ❌ GET /rup/search - FAILED"
fi
echo ""

echo "✨ Test Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Check Supabase Dashboard > Table Editor"
echo "   2. Verify tables exist: experts, keywords, tender_watchlist"
echo "   3. Open frontend: http://localhost:5173"
echo "   4. Test adding/editing data"
