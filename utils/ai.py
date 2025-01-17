import os
from openai import OpenAI

BASE_URLS = [
    'https://api-handler-ddc-free-api.hf.space/v2',
    'https://devsdocode-ddc-free-api.hf.space/v2',
    'https://free-ddc.xiolabs.xyz/v1'
]

client = OpenAI(
    base_url = BASE_URLS[0],
    api_key = os.environ.get("API_KEY")
)

def generate_response(user, message):
    """
    Generate a personalized response based on user's communication style.
    """
    identity = f"name: {user.name}, age: {user.age}, gender: {user.gender}, city: {user.city}, interests: {user.interests}"
    personality = "\n".join([f"Q: {question}\nA: {answer}" for question, answer in user.questionnaire.items()])
    prompt = (
        f"You are a digital assistant mimicking the user's conversational style.\n"
        f"User has provided his identity as {identity}"
        f"The user has provided the following personality traits:\n{personality}\n"
        f"Now, respond to the following message in their style:\n{message}"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a digital assistant mimicking the user's conversational style."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return "Sorry, I encountered an issue while generating the response."
