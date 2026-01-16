import google.generativeai as genai
import os

# Try to get key from env, but printing instruction if missing
key = os.getenv("GEMINI_API_KEY")
if not key:
    print("WARNING: GEMINI_API_KEY not set in environment.")
else:
    genai.configure(api_key=key)
    print("Checking available models...")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")
