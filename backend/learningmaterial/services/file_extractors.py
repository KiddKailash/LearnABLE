import fitz  # PyMuPDF to read pdfs and extract text
from docx import Document
from pptx import Presentation
import os
import tempfile
from pptx.enum.shapes import PP_PLACEHOLDER

tmp_dir = os.path.join(tempfile.gettempdir(), "pptx_images")
os.makedirs(tmp_dir, exist_ok=True)

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
    slide_data = []

    for idx, slide in enumerate(prs.slides):
        title = ""
        content = ""
        images = []

        for shape in slide.shapes:
            # 1) Capture ALL text frames, not just placeholders
            if hasattr(shape, "text_frame") and shape.text_frame:
                # Join all paragraphs in this shape
                text = "\n".join(p.text.strip() for p in shape.text_frame.paragraphs if p.text.strip())
                if not text:
                    pass
                elif shape.is_placeholder and shape.placeholder_format.type == PP_PLACEHOLDER.TITLE:
                    title = text
                else:
                    # Anything else (body placeholders or regular text boxes) goes into content
                    content += text + "\n"

            # 2) Capture images as before
            if hasattr(shape, "image"):
                blob = shape.image.blob
                ext  = shape.image.ext
                fname = f"slide_{idx}_img_{len(images)}.{ext}"
                fpath = os.path.join(tmp_dir, fname)
                with open(fpath, "wb") as f:
                    f.write(blob)
                images.append({
                    "path":   fpath,
                    "left":   shape.left,
                    "top":    shape.top,
                    "width":  shape.width,
                    "height": shape.height
                })

        slide_data.append({
            "title":   title,
            "content": content.strip(),
            "images":  images
        })

    return slide_data