from transformers import AutoProcessor, AutoModelForCausalLM
import os

model_id = "google/medgemma-1.5-4b-it" 
HF_TOKEN = os.getenv("HF_TOKEN")

print(f"Checking access to model: {model_id}")
token = HF_TOKEN
if token:
    print("HF_TOKEN found in environment.")
else:
    print("WARNING: HF_TOKEN not found.")

try:
    from huggingface_hub import HfApi
    api = HfApi(token=token)
    user_info = api.whoami()
    print(f"Token belongs to user: {user_info['name']} (Type: {user_info['type']})")
    
    # Check permissions
    # print(f"Token permissions: {user_info.get('auth', {}).get('accessToken', {}).get('role')}")

except Exception as e:
    print(f"Error checking token identity: {e}")

try:
    processor = AutoProcessor.from_pretrained(model_id, token=token)
    print("Successfully loaded processor (Access confirmed).")
except Exception as e:
    print(f"Error loading processor: {e}")

try:
    # Just checking config access to be fast
    from transformers import AutoConfig
    config = AutoConfig.from_pretrained(model_id, token=token)
    print("Successfully loaded config (Access confirmed).")
except Exception as e:
    print(f"Error loading config: {e}")
