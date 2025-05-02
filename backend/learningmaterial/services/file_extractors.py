import fitz  # PyMuPDF to read pdfs and extract text
from docx import Document
from pptx import Presentation

def extract_text_from_pdf(path):
    with fitz.open(path) as doc:
        lines = []
        for page in doc:
            blocks = page.get_text("dict")["blocks"]
            for block in blocks:
                if "lines" in block:
                    for line in block["lines"]:
                        sentence = " ".join([span["text"] for span in line["spans"]])
                        lines.append(sentence)
        return "\n".join(lines)

def extract_text_from_docx(path):
    doc = Document(path)
    lines = []
    for para in doc.paragraphs:
        style = para.style.name.lower()
        text = para.text.strip()
        if not text:
            continue
        if "heading" in style:
            # Format headings with clear markup
            lines.append(f"[{para.style.name}] {text}")
        else:
            lines.append(text)
    return "\n".join(lines)

def extract_text_from_pptx(path):
    prs = Presentation(path)
    slide_texts = []
    for slide in prs.slides:
        text = ""
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                text += shape.text.strip() + "\n"
        slide_texts.append(text.strip())
    return slide_texts
