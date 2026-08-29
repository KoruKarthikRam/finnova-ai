import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

# Add current directory to sys.path
ai_service_dir = os.path.dirname(__file__)
sys.path.append(ai_service_dir)

from app import (
    app,
    health_check,
    analyze_expenses,
    classify_transaction,
    detect_anomalies,
    forecast_expenses,
    search_knowledge,
    detect_subscriptions,
    AnalysisRequest,
    ClassifyRequest,
    AnomalyRequest,
    ForecastRequest,
    SearchRequest,
    SubscriptionAnalysisRequest,
    TransactionItem
)

def run_integration_tests():
    print("="*60)
    print("🚀 FINNOVA AI - END-TO-END MICROSERVICE INTEGRATION TEST")
    print("="*60)

    # 1. Health Check Test
    print("\n[TEST 1] Testing /health Endpoint...")
    health_res = health_check()
    assert health_res["status"] == "healthy", "Health check failed!"
    print("✅ /health PASSED:", health_res)

    # Sample Transactions
    sample_txs = [
        TransactionItem(id="1", amount=50000, category="Salary", type="income", date="2026-08-01", description="Monthly Salary"),
        TransactionItem(id="2", amount=18000, category="Rent", type="expense", date="2026-08-02", description="House rent payment"),
        TransactionItem(id="3", amount=4500, category="Food", type="expense", date="2026-08-05", description="Zomato food delivery"),
        TransactionItem(id="4", amount=499, category="Entertainment", type="expense", date="2026-08-10", description="Netflix subscription"),
        TransactionItem(id="5", amount=999, category="Bills", type="expense", date="2026-08-12", description="Airtel broadband bill"),
        TransactionItem(id="6", amount=2000, category="Healthcare", type="expense", date="2026-08-15", description="Apollo Pharmacy medicines"),
        TransactionItem(id="7", amount=25000, category="Shopping", type="expense", date="2026-08-20", description="Unusual luxury electronics shopping outlier")
    ]

    # 2. Analyze Expenses Test
    print("\n[TEST 2] Testing /analyze Endpoint...")
    analyze_res = analyze_expenses(AnalysisRequest(transactions=sample_txs))
    assert analyze_res["success"] is True, "Analyze endpoint failed!"
    print("✅ /analyze PASSED! Total Expense:", analyze_res["data"]["total_expense"], "Daily Avg:", analyze_res["data"]["daily_average"])

    # 3. Text Classifier Test
    print("\n[TEST 3] Testing /classify Endpoint...")
    classify_res = classify_transaction(ClassifyRequest(description="Swiggy pizza order"))
    assert classify_res["category"] == "Food", "Classification failed!"
    print("✅ /classify PASSED! Input: 'Swiggy pizza order' -> Category:", classify_res["category"], "(Confidence:", classify_res["confidence"], ")")

    # 4. Anomaly Detection Test
    print("\n[TEST 4] Testing /anomalies Endpoint...")
    anomaly_res = detect_anomalies(AnomalyRequest(transactions=sample_txs))
    assert anomaly_res["success"] is True, "Anomaly detection failed!"
    print("✅ /anomalies PASSED! Outliers Flagged:", len(anomaly_res["anomalies"]))

    # 5. Expense Forecast Test
    print("\n[TEST 5] Testing /forecast Endpoint...")
    forecast_res = forecast_expenses(ForecastRequest(transactions=sample_txs))
    assert forecast_res["success"] is True, "Forecast endpoint failed!"
    print("✅ /forecast PASSED! Next Month Est:", forecast_res["forecast"]["next_month"], "Predicted:", forecast_res["forecast"]["predicted_amount"])

    # 6. RAG Knowledge Search Test
    print("\n[TEST 6] Testing /search-knowledge Endpoint (RAG)...")
    rag_res = search_knowledge(SearchRequest(query="What is the maximum limit under Section 80C?", limit=2))
    assert rag_res["success"] is True and len(rag_res["matches"]) > 0, "RAG search failed!"
    print("✅ /search-knowledge PASSED! Top Match Source:", rag_res["matches"][0]["source"], "Score:", rag_res["matches"][0]["score"])

    # 7. Subscriptions Detection Test
    print("\n[TEST 7] Testing /subscriptions Endpoint...")
    sub_res = detect_subscriptions(SubscriptionAnalysisRequest(transactions=sample_txs))
    assert sub_res["success"] is True, "Subscriptions detection failed!"
    print("✅ /subscriptions PASSED! Active Subscriptions Found:", len(sub_res["subscriptions"]), "Total Overhead: ₹", sub_res["total_monthly_overhead"])

    print("\n" + "="*60)
    print("🎉 ALL 7 MICROSERVICE INTEGRATION TESTS PASSED 100% SUCCESSFULLY!")
    print("="*60)

if __name__ == "__main__":
    run_integration_tests()
