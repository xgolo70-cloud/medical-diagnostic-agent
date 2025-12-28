from typing import BinaryIO
from pypdf import PdfReader

def extract_text_from_pdf(file: BinaryIO) -> str:
    """
    Extracts text from a PDF file stream.
    
    Args:
        file: A binary file-like object containing the PDF data.
        
    Returns:
        The extracted text content from all pages.
        
    Raises:
        Exception: If the file cannot be read or processed.
    """
    try:
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")
