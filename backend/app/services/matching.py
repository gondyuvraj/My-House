from typing import Tuple, List, Dict, Any, Optional

def calculate_compatibility(
    user_lifestyle: Optional[dict],
    user_city: Optional[str],
    user_gender: Optional[str],
    user_budget_min: Optional[int],
    user_budget_max: Optional[int],
    target_lifestyle: Optional[dict],
    target_city: Optional[str],
    target_gender: Optional[str],
    target_gender_preference: Optional[str] = "any",
    target_rent: Optional[int] = None
) -> Tuple[int, List[str]]:
    """
    Computes a 0-100% compatibility score and provides clear reasons.
    Weights:
      - Lifestyle (smoking, drinking, food, sleep, cleanliness, guests, pets, noise, WFH): 50 pts
      - Location / City match: 20 pts
      - Budget overlap / affordability: 15 pts
      - Gender preference compatibility: 15 pts
    """
    score = 0
    reasons = []

    u_life = user_lifestyle or {}
    t_life = target_lifestyle or {}

    # 1. City / Location (20 pts)
    if user_city and target_city and user_city.strip().lower() == target_city.strip().lower():
        score += 20
        reasons.append(f"Same preferred city ({user_city})")
    elif not user_city or not target_city:
        score += 10 # neutral

    # 2. Gender Preference Check (15 pts)
    gender_ok = True
    pref = (target_gender_preference or "any").lower()
    if pref != "any" and user_gender:
        if pref != user_gender.lower():
            gender_ok = False
    
    if gender_ok:
        score += 15
        reasons.append("Gender preferences align")
    else:
        score += 0

    # 3. Budget / Rent Overlap (15 pts)
    if target_rent is not None and user_budget_min is not None and user_budget_max is not None:
        if user_budget_min <= target_rent <= user_budget_max:
            score += 15
            reasons.append(f"Rent ₹{target_rent:,} matches your budget bracket")
        elif abs(target_rent - user_budget_max) <= 3000 or abs(target_rent - user_budget_min) <= 3000:
            score += 9
            reasons.append("Rent is within flexible budget margin")
        else:
            score += 3
    else:
        score += 10 # Default partial

    # 4. Lifestyle Preferences (50 pts total)
    # Smoking (8 pts)
    u_smoke = str(u_life.get("smoking", "never")).lower()
    t_smoke = str(t_life.get("smoking", "never")).lower()
    if u_smoke == t_smoke:
        score += 8
        if u_smoke == "never":
            reasons.append("Both are non-smokers")
        else:
            reasons.append("Matching smoking habits")
    elif "never" not in [u_smoke, t_smoke]:
        score += 5
    else:
        score += 1

    # Drinking (6 pts)
    u_drink = str(u_life.get("drinking", "never")).lower()
    t_drink = str(t_life.get("drinking", "never")).lower()
    if u_drink == t_drink:
        score += 6
        if u_drink == "never":
            reasons.append("Both non-drinkers")
    else:
        score += 3

    # Food Preference (6 pts)
    u_food = str(u_life.get("food_preference", "any")).lower()
    t_food = str(t_life.get("food_preference", "any")).lower()
    if u_food == t_food or u_food == "any" or t_food == "any":
        score += 6
        if u_food == t_food and u_food in ["veg", "vegan"]:
            reasons.append(f"Both prefer {u_food} diet")
        else:
            reasons.append("Food habits are compatible")
    else:
        score += 2

    # Sleep Schedule (8 pts)
    u_sleep = str(u_life.get("sleep_schedule", "flexible")).lower()
    t_sleep = str(t_life.get("sleep_schedule", "flexible")).lower()
    if u_sleep == t_sleep:
        score += 8
        label = "Night owls" if "night" in u_sleep else ("Early birds" if "early" in u_sleep else "Flexible routine")
        reasons.append(f"Synchronized sleep routine ({label})")
    elif "flexible" in [u_sleep, t_sleep]:
        score += 6
        reasons.append("Adaptable sleep schedule")
    else:
        score += 2

    # Cleanliness (8 pts)
    u_clean = int(u_life.get("cleanliness", 3))
    t_clean = int(t_life.get("cleanliness", 3))
    diff = abs(u_clean - t_clean)
    if diff == 0:
        score += 8
        reasons.append(f"Identical cleanliness standard ({u_clean}/5)")
    elif diff == 1:
        score += 6
        reasons.append("Very similar cleanliness expectations")
    else:
        score += 2

    # Guests Allowed (4 pts)
    u_guest = bool(u_life.get("guests_allowed", True))
    t_guest = bool(t_life.get("guests_allowed", True))
    if u_guest == t_guest:
        score += 4
        reasons.append("Mutual comfort with guest visits")
    else:
        score += 1

    # Pets (4 pts)
    u_pet = bool(u_life.get("pets_allowed", False))
    t_pet = bool(t_life.get("pets_allowed", False))
    if u_pet == t_pet:
        score += 4
        if u_pet:
            reasons.append("Both are pet friendly")
    else:
        score += 1

    # Noise & WFH (6 pts)
    u_noise = str(u_life.get("noise_level", "moderate")).lower()
    t_noise = str(t_life.get("noise_level", "moderate")).lower()
    if u_noise == t_noise:
        score += 3
        reasons.append(f"Preferred noise environment: {u_noise}")
    else:
        score += 1

    u_wfh = bool(u_life.get("work_from_home", False))
    t_wfh = bool(t_life.get("work_from_home", False))
    if u_wfh == t_wfh:
        score += 3
        if u_wfh:
            reasons.append("Both work remotely (WFH)")
    else:
        score += 1

    # Cap score between 35 and 99
    final_score = max(35, min(99, score))
    return final_score, reasons[:5]

