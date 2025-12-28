# Product Guidelines

## Clinical Communication & Style
- **Adaptive Clinical Tone:** The agent shall utilize a formal, technically precise academic tone for specialists while maintaining a professional and concise delivery for general practitioners.
- **Terminology Standard:** All communication must prioritize standardized medical terminology derived from SNOMED CT and ICD-10.

## Diagnostic Integrity & Uncertainty
- **Confidence Transparency:** All differential diagnoses must be presented with clear, color-coded confidence indicators.
- **Uncertainty Management:** The system must issue explicit warnings for "Low Confidence" results and proactively identify specific missing data (e.g., specific lab tests or history points) required to improve diagnostic accuracy (Evidence-Gap Analysis).
- **Signal-to-Noise Ratio:** Apply conservative thresholding to suppress diagnoses that do not meet minimum statistical confidence levels, ensuring clinicians are not overwhelmed by improbable results.

## Dashboard & Data Visualization
- **Evidence Linking:** Implement a "Deep Link" architecture where every diagnosis is directly connected to the patient data points and medical literature that supported it.
- **Visual Hierarchy:** Adopt a "Summary First, Detail on Demand" layout to ensure critical information is accessible within seconds, while allowing for deep-dive analysis.
- **Standardized Coding Visuals:** Maintain consistent visual styling for medical codes (ICD-10, SNOMED CT) to ensure rapid recognition and cross-system compatibility.

## Knowledge Management & Updates
- **Hybrid Knowledge Pipeline:** Utilize automated NLP pipelines to ingest new peer-reviewed research, followed by mandatory human-in-the-loop verification by clinical experts before logic updates are deployed to the core model.
- **Continuous Validation:** Every knowledge update must pass a rigorous regression test against established clinical benchmark datasets.

## Privacy, Security & Accountability
- **Zero-Trust Data Security:** Implement end-to-end encryption for all data at rest and in transit, governed by strict identity and access management controls.
- **PII Minimization:** Proactively use automated de-identification or masking techniques to handle Patient Health Information (PHI) during non-critical processing stages.
- **Immutable Auditability:** Maintain comprehensive, immutable audit logs of all diagnostic queries and system interactions to ensure clinical accountability and regulatory compliance.
