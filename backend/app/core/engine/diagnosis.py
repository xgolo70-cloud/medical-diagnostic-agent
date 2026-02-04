import json
import os
import datetime
import requests
from PIL import Image
from io import BytesIO
from app.schemas.patient import PatientData

# Demo mode - set to True to use mock responses instead of AI API
DEMO_MODE = os.environ.get("DEMO_MODE", "true").lower() == "true"

# Only import and configure genai if not in demo mode
if not DEMO_MODE:
    import google.generativeai as genai
    API_KEY = os.environ.get("GOOGLE_API_KEY", "")
    if API_KEY:
        genai.configure(api_key=API_KEY)

class DiagnosisEngine:
    def __init__(self):
        if not DEMO_MODE:
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    def generate_diagnosis(self, patient_data: PatientData, lab_results: str = "") -> dict:
        """
        Generate a diagnosis based on patient data, optional lab results, and optional image URL.
        """
        if DEMO_MODE:
            return self._generate_mock_diagnosis(patient_data, lab_results)
        
        # Prepare inputs for the model
        model_inputs = []
        
        # 1. Text Prompt
        prompt_text = self._construct_prompt_text(patient_data, lab_results)
        model_inputs.append(prompt_text)
        
        # 2. Image (if available)
        if patient_data.image_url:
            try:
                image_data = self._download_image(patient_data.image_url)
                if image_data:
                    model_inputs.append(image_data)
                    print(f"✅ Image loaded successfully from {patient_data.image_url}")
                else:
                    print(f"⚠️ Failed to download image from {patient_data.image_url}")
                    model_inputs[0] += "\n\n(Note: An image was provided but could not be accessed. Proceed with text analysis only.)"
            except Exception as e:
                print(f"❌ Error processing image: {str(e)}")
                model_inputs[0] += f"\n\n(Note: Error processing provided image: {str(e)})"

        # Generate content
        try:
            response = self.model.generate_content(model_inputs)
            
            text_response = response.text.strip()
            # Clean up markdown formatting if present
            if text_response.startswith("```json"):
                text_response = text_response[7:]
            if text_response.endswith("```"):
                text_response = text_response[:-3]
            
            return json.loads(text_response.strip())
        except json.JSONDecodeError:
             return {"error": "Failed to parse AI response", "raw": response.text}
        except Exception as e:
            return {"error": f"AI generation failed: {str(e)}"}

    def _download_image(self, url: str):
        """Download image from URL and convert to PIL Image"""
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return Image.open(BytesIO(response.content))
        except Exception as e:
            print(f"Error downloading image: {e}")
            return None

    def _generate_mock_diagnosis(self, patient: PatientData, lab_results: str = "") -> dict:
        """Generate a realistic mock diagnosis for demo purposes"""
        
        # Analyze symptoms for mock response
        symptoms_lower = [s.lower() for s in patient.symptoms]
        
        diagnoses = []
        
        # Fever + Cough -> Respiratory infection
        if any('fever' in s for s in symptoms_lower) and any('cough' in s for s in symptoms_lower):
            diagnoses.append({
                "condition": "Upper Respiratory Tract Infection",
                "confidence": 0.85,
                "rationale": f"Patient presents with fever and cough, classic symptoms of URTI. Age {patient.age} and symptoms pattern consistent with viral etiology."
            })
            diagnoses.append({
                "condition": "Influenza",
                "confidence": 0.65,
                "rationale": "Combination of fever and respiratory symptoms during flu season warrants consideration."
            })
            diagnoses.append({
                "condition": "COVID-19",
                "confidence": 0.45,
                "rationale": "Respiratory symptoms with fever should include COVID-19 in differential until ruled out."
            })
        
        # Headache
        elif any('headache' in s for s in symptoms_lower):
            diagnoses.append({
                "condition": "Tension Headache",
                "confidence": 0.75,
                "rationale": f"Primary headache presentation in {patient.age}-year-old {patient.gender}."
            })
            diagnoses.append({
                "condition": "Migraine",
                "confidence": 0.50,
                "rationale": "Should be considered if headache is recurrent or has associated symptoms."
            })
        
        # Chest pain
        elif any('chest' in s for s in symptoms_lower):
            diagnoses.append({
                "condition": "Musculoskeletal Chest Pain",
                "confidence": 0.60,
                "rationale": "Most common cause of chest pain, especially in younger patients."
            })
            diagnoses.append({
                "condition": "GERD",
                "confidence": 0.45,
                "rationale": "Gastroesophageal reflux can present with chest discomfort."
            })
        
        # Default fallback
        if not diagnoses:
            diagnoses.append({
                "condition": "Requires Further Evaluation",
                "confidence": 0.50,
                "rationale": f"Based on symptoms: {', '.join(patient.symptoms)}. Additional workup recommended."
            })
        
        return {
            "patient_id": patient.patient_id,
            "differential_diagnosis": [
                {
                    "diagnosis_id": f"DX-{i+1:03d}",
                    "primary_diagnosis": d["condition"],
                    "confidence": d["confidence"],
                    "rationale": d["rationale"]
                }
                for i, d in enumerate(diagnoses)
            ],
            "recommended_tests": [
                "Complete Blood Count (CBC)",
                "Basic Metabolic Panel",
                "Chest X-Ray" if any('cough' in s or 'chest' in s for s in symptoms_lower) else "ECG",
                "COVID-19 PCR Test" if any('fever' in s for s in symptoms_lower) else "Urinalysis"
            ],
            "citations": [
                "Harrison's Principles of Internal Medicine, 21st Edition",
                "UpToDate Clinical Decision Support",
                "CDC Clinical Guidelines 2024"
            ],
            "clinical_notes": f"Demo diagnosis for patient {patient.patient_id}. This is a simulated response for testing purposes.",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

    def _construct_prompt_text(self, patient: PatientData, lab_results: str = "") -> str:
        prompt = f"""
        Act as a medical expert. Analyze the following patient data:
        Age: {patient.age}
        Gender: {patient.gender}
        Symptoms: {', '.join(patient.symptoms)}
        History: {', '.join(patient.medical_history)}
        Vitals: {patient.vitals}
        """
        
        if lab_results:
            prompt += f"\n\nLab Results / Reports:\n{lab_results}\n"
            
        if patient.image_url:
            prompt += f"\n\nMedical Image Provided: {patient.image_url}\nType: {patient.image_type or 'Unknown'}\n"
            
        prompt += """
        Provide a differential diagnosis in JSON format with the following structure:
        {
            "differential_diagnosis": [
                {"condition": "string", "confidence": float (0-1), "rationale": "string"}
            ],
            "recommended_tests": ["string"],
            "citations": ["string"]
        }
        """
        return prompt
