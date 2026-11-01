import pytest
from app.services.matching import calculate_compatibility
from app.utils.security import get_password_hash, verify_password, create_access_token, decode_token

def test_password_hashing():
    password = "MySecurePassword123!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_tokens():
    payload = {"sub": "user_12345", "role": "seeker"}
    token = create_access_token(payload)
    decoded = decode_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user_12345"
    assert decoded["role"] == "seeker"
    assert decoded["type"] == "access"

def test_compatibility_matching():
    user_lifestyle = {
        "smoking": "never",
        "drinking": "never",
        "food_preference": "veg",
        "sleep_schedule": "early_bird",
        "cleanliness": 5,
        "guests_allowed": True,
        "pets_allowed": False,
        "noise_level": "quiet",
        "work_from_home": True
    }
    
    target_lifestyle = {
        "smoking": "never",
        "drinking": "never",
        "food_preference": "veg",
        "sleep_schedule": "early_bird",
        "cleanliness": 5,
        "guests_allowed": True,
        "pets_allowed": False,
        "noise_level": "quiet",
        "work_from_home": True
    }

    score, reasons = calculate_compatibility(
        user_lifestyle=user_lifestyle,
        user_city="Pune",
        user_gender="female",
        user_budget_min=8000,
        user_budget_max=15000,
        target_lifestyle=target_lifestyle,
        target_city="Pune",
        target_gender="female",
        target_gender_preference="female",
        target_rent=12000
    )

    assert score >= 90
    assert len(reasons) > 0
    assert any("Same preferred city" in r for r in reasons)
    assert any("non-smokers" in r.lower() for r in reasons)

def test_incompatible_matching():
    user_lifestyle = {
        "smoking": "never",
        "drinking": "never",
        "food_preference": "veg",
        "sleep_schedule": "early_bird",
        "cleanliness": 5,
        "guests_allowed": False,
        "pets_allowed": False,
        "noise_level": "quiet",
        "work_from_home": True
    }
    
    target_lifestyle = {
        "smoking": "regular",
        "drinking": "regular",
        "food_preference": "non-veg",
        "sleep_schedule": "night_owl",
        "cleanliness": 1,
        "guests_allowed": True,
        "pets_allowed": True,
        "noise_level": "lively",
        "work_from_home": False
    }

    score, reasons = calculate_compatibility(
        user_lifestyle=user_lifestyle,
        user_city="Pune",
        user_gender="male",
        user_budget_min=5000,
        user_budget_max=8000,
        target_lifestyle=target_lifestyle,
        target_city="Delhi",
        target_gender="female",
        target_gender_preference="female",
        target_rent=35000
    )

    # Score should be low
    assert score <= 50

def test_avatar_filename_validation():
    from app.utils.validators import validate_image_file
    from fastapi import UploadFile, HTTPException
    import io

    # Valid PNG image file
    valid_file = UploadFile(filename="profile_photo.png", file=io.BytesIO(b"dummy image bytes"), headers={"content-type": "image/png"})
    validate_image_file(valid_file)

    # Invalid extension
    invalid_file = UploadFile(filename="script.exe", file=io.BytesIO(b"executable"), headers={"content-type": "application/x-msdownload"})
    with pytest.raises(HTTPException):
        validate_image_file(invalid_file)


