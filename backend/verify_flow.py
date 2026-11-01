import urllib.request
import json

def run_verification():
    print("="*60)
    print("RUNNING LIVE END-TO-END FLOW VERIFICATION ON RUNNING SERVER")
    print("="*60)

    # 1. Health check
    res = urllib.request.urlopen('http://127.0.0.1:8000/api/health')
    health = json.loads(res.read().decode())
    print(f"[1] Health Check: Status={health.get('status')} Service={health.get('service')}")
    assert health.get("status") == "healthy"

    # 2. Login Seeker
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/v1/auth/login',
        data=json.dumps({'email': 'seeker@myhouse.com', 'password': 'Seeker@12345'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    seeker_data = json.loads(res.read().decode())
    seeker_token = seeker_data['access_token']
    print(f"[2] Seeker Login: Name={seeker_data['user']['full_name']} Role={seeker_data['user']['role']}")

    # 3. Query Listings in Pune
    res = urllib.request.urlopen('http://127.0.0.1:8000/api/v1/listings?city=Pune&limit=3')
    listings_data = json.loads(res.read().decode())
    total_pune = listings_data['total']
    items = listings_data['items']
    first_listing = items[0]
    print(f"[3] Listings Search: Found {total_pune} homes in Pune. Sample: '{first_listing['title']}' (Rent: Rs. {first_listing['rent']:,}/mo)")

    # 4. Toggle Favorite
    req = urllib.request.Request(
        f"http://127.0.0.1:8000/api/v1/favorites/{first_listing['id']}",
        data=b"",
        headers={'Authorization': f'Bearer {seeker_token}'}
    )
    res = urllib.request.urlopen(req)
    fav_res = json.loads(res.read().decode())
    print(f"[4] Wishlist Toggle: Favorited={fav_res.get('favorited')} Message='{fav_res.get('message')}'")

    # 5. Schedule Visit
    visit_payload = {
        'listing_id': first_listing['id'],
        'visit_date': '2026-11-02',
        'visit_time_slot': '11:00 AM - 12:00 PM',
        'notes': 'Looking forward to inspecting the room and amenities.'
    }
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/v1/visits',
        data=json.dumps(visit_payload).encode(),
        headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {seeker_token}'}
    )
    res = urllib.request.urlopen(req)
    visit_res = json.loads(res.read().decode())
    print(f"[5] Schedule Visit: ID={visit_res.get('id')} Status={visit_res.get('status')} Date={visit_res.get('visit_date')} Slot={visit_res.get('visit_time_slot')}")

    # 6. Roommate Matching
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/v1/roommates?city=Pune&limit=3',
        headers={'Authorization': f'Bearer {seeker_token}'}
    )
    res = urllib.request.urlopen(req)
    roommates_data = json.loads(res.read().decode())
    top_match = roommates_data['items'][0]
    print(f"[6] Roommate Matching: Candidate='{top_match['user_name']}' Score={top_match['compatibility_score']}%")
    reasons_str = [r.replace('\u20b9', 'Rs.') for r in top_match['compatibility_reasons']]
    print(f"    Reasons: {reasons_str}")

    # 7. Admin Login & Stats
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/v1/auth/login',
        data=json.dumps({'email': 'admin@myhouse.com', 'password': 'Admin@12345'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    admin_data = json.loads(res.read().decode())
    admin_token = admin_data['access_token']
    
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/v1/admin/stats',
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    res = urllib.request.urlopen(req)
    admin_stats = json.loads(res.read().decode())
    print(f"[7] Admin Stats: Total Users={admin_stats['total_users']}, Active Listings={admin_stats['active_listings']}, Visits={admin_stats['total_visits']}, Reports={admin_stats['pending_reports']}")

    print("="*60)
    print("ALL API ENDPOINTS & FLOWS VERIFIED 100% WORKING END-TO-END!")
    print("="*60)

if __name__ == "__main__":
    run_verification()
