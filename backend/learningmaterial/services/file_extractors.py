import fitz  # PyMuPDF to read pdfs and extract text
from docx import Document
from pptx import Presentation
import os

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
    from pptx.enum.shapes import PP_PLACEHOLDER
    prs = Presentation(path)
    slide_data = []

    for slide_idx, slide in enumerate(prs.slides):
        title = ""
        content = ""
        images = []

        for shape in slide.shapes:
            if hasattr(shape, "image"):
                image_bytes = shape.image.blob
                image_ext = shape.image.ext
                image_filename = f"slide_{slide_idx}_img_{len(images)}.{image_ext}"
                image_path = os.path.join("/tmp/pptx_images", image_filename)

                os.makedirs(os.path.dirname(image_path), exist_ok=True)
                with open(image_path, "wb") as f:
                    f.write(image_bytes)

                images.append(image_path)

            if hasattr(shape, "text_frame") and shape.text_frame:
                if shape.is_placeholder:
                    p_type = shape.placeholder_format.type
                    if p_type == PP_PLACEHOLDER.TITLE:
                        title = shape.text.strip()
                    elif p_type == PP_PLACEHOLDER.BODY:
                        content += shape.text.strip() + "\n"

        slide_data.append({
            "title": title.strip(),
            "content": content.strip(),
            "images": images
        })

    return slide_data