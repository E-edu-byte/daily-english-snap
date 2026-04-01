#!/usr/bin/env python3
"""
Daily English Snap - Google Analytics データ取得スクリプト
GA4 Data API からアクセス数を取得し、Supabase に保存します。
"""

import os
import json
from datetime import datetime, timedelta
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest,
    DateRange,
    Dimension,
    Metric,
)
from google.oauth2 import service_account
from supabase import create_client, Client

# 設定
GA_PROPERTY_ID = "530834971"

def get_analytics_client():
    """Google Analytics クライアントを作成"""
    credentials_json = os.environ.get("GOOGLE_CREDENTIALS_JSON")
    if not credentials_json:
        raise ValueError("GOOGLE_CREDENTIALS_JSON environment variable not set")

    credentials_info = json.loads(credentials_json)
    credentials = service_account.Credentials.from_service_account_info(
        credentials_info,
        scopes=["https://www.googleapis.com/auth/analytics.readonly"]
    )
    return BetaAnalyticsDataClient(credentials=credentials)

def get_supabase_client() -> Client:
    """Supabase クライアントを作成"""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise ValueError("Supabase credentials not set")
    return create_client(url, key)

def fetch_analytics_data(client: BetaAnalyticsDataClient) -> dict:
    """GA4 からアナリティクスデータを取得"""
    today = datetime.now().strftime("%Y-%m-%d")
    thirty_days_ago = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

    # 累計データ（過去30日間）
    request = RunReportRequest(
        property=f"properties/{GA_PROPERTY_ID}",
        date_ranges=[DateRange(start_date=thirty_days_ago, end_date=today)],
        metrics=[
            Metric(name="screenPageViews"),
            Metric(name="totalUsers"),
            Metric(name="sessions"),
        ],
    )
    response = client.run_report(request)

    total_page_views = 0
    total_users = 0
    total_sessions = 0

    if response.rows:
        row = response.rows[0]
        total_page_views = int(row.metric_values[0].value)
        total_users = int(row.metric_values[1].value)
        total_sessions = int(row.metric_values[2].value)

    # 今日のデータ
    today_request = RunReportRequest(
        property=f"properties/{GA_PROPERTY_ID}",
        date_ranges=[DateRange(start_date=today, end_date=today)],
        metrics=[
            Metric(name="screenPageViews"),
            Metric(name="totalUsers"),
            Metric(name="sessions"),
        ],
    )
    today_response = client.run_report(today_request)

    today_page_views = 0
    today_users = 0
    today_sessions = 0

    if today_response.rows:
        row = today_response.rows[0]
        today_page_views = int(row.metric_values[0].value)
        today_users = int(row.metric_values[1].value)
        today_sessions = int(row.metric_values[2].value)

    # 人気ページ（過去30日間）
    pages_request = RunReportRequest(
        property=f"properties/{GA_PROPERTY_ID}",
        date_ranges=[DateRange(start_date=thirty_days_ago, end_date=today)],
        dimensions=[Dimension(name="pagePath")],
        metrics=[Metric(name="screenPageViews")],
        limit=10,
    )
    pages_response = client.run_report(pages_request)

    top_pages = []
    for row in pages_response.rows:
        top_pages.append({
            "path": row.dimension_values[0].value,
            "views": int(row.metric_values[0].value),
        })

    return {
        "lastUpdated": datetime.now().isoformat(),
        "period": f"{thirty_days_ago} ~ {today}",
        "pageViews": total_page_views,
        "todayPageViews": today_page_views,
        "users": total_users,
        "todayUsers": today_users,
        "sessions": total_sessions,
        "todaySessions": today_sessions,
        "topPages": top_pages,
    }

def save_to_supabase(supabase: Client, data: dict):
    """アナリティクスデータをSupabaseに保存"""
    # analytics テーブルに保存（upsert）
    record = {
        "id": "daily-english-snap",  # 固定ID
        "data": data,
        "updated_at": datetime.now().isoformat(),
    }

    supabase.table("analytics").upsert(record).execute()
    print("✅ Analytics data saved to Supabase")

def main():
    print("🚀 Fetching Google Analytics data...")
    print(f"⏰ Timestamp: {datetime.now().isoformat()}")
    print("---")

    try:
        # クライアント作成
        ga_client = get_analytics_client()
        supabase = get_supabase_client()

        # データ取得
        analytics_data = fetch_analytics_data(ga_client)

        print(f"📊 Page Views (30 days): {analytics_data['pageViews']}")
        print(f"📊 Today's Page Views: {analytics_data['todayPageViews']}")
        print(f"👤 Users (30 days): {analytics_data['users']}")
        print(f"👤 Today's Users: {analytics_data['todayUsers']}")

        # Supabaseに保存
        save_to_supabase(supabase, analytics_data)

        print("---")
        print("🎉 Done!")

    except Exception as e:
        print(f"❌ Error: {e}")
        raise

if __name__ == "__main__":
    main()
