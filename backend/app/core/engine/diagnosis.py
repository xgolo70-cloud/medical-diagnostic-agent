import json
import google.generativeai as genai
from app.schemas.patient import PatientData

class DiagnosisEngine:
    def __init__(self):
        # In a real app, API key would be configured here
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')

    def generate_diagnosis(self, patient_data: PatientData, lab_results: str = "") -> dict:
        prompt = self._construct_prompt(patient_data, lab_results)
        response = self.model.generate_content(prompt)
        
        try:
            # Clean up potential markdown formatting from LLM response
            text_response = response.text.strip()
            if text_response.startswith("```json"):
                text_response = text_response[7:]
            if text_response.endswith("```"):
                text_response = text_response[:-3]
            
            return json.loads(text_response.strip())
        except json.JSONDecodeError:
             # Fallback or error handling
             return {"error": "Failed to parse AI response", "raw": response.text}

    def _construct_prompt(self, patient: PatientData, lab_results: str = "") -> str:
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
            
        prompt += """
        Provide a differential diagnosis in JSON format with the following structure:
        {
            "differential_diagnosis": [
                {"condition": "string", "confidence": float (0-1), "rationale": "string"}
            ],
            "recommended_tests": ["string"],
            "citations": ["string"]
        }

        IMPORTANT:
        1. The 'rationale' field MUST explicitly reference the specific symptoms or history points from the input that support the diagnosis.
        2. Provide 'citations' to standard medical literature or guidelines where applicable.
        """
        return prompt
