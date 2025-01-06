def calculate_match_score(user, match):
    score = 0

    if user.city == match.city:
        score += 50

    shared_interests = set(user.interests or []).intersection(set(match.interests or []))
    score += len(shared_interests) * 10

    age_diff = abs(user.age - match.age)
    if age_diff <= 5:
        score += 30
    elif age_diff <= 10:
        score += 15
    return score