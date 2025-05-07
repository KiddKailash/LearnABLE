from docx import Document
from pptx import Presentation
from pptx.util import Inches, Pt
from reportlab.pdfgen import canvas
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from gtts import gTTS
import os


def create_docx_from_text(text, path):
    doc = Document()
    for line in text.split("\n"):
        if line.startswith("[Heading") and "]" in line:
            heading_text = line.split("]", 1)[1].strip()
            heading_level = 1
            if "2" in line:
                heading_level = 2
            elif "3" in line:
                heading_level = 3
            doc.add_heading(heading_text, level=heading_level)
        else:
            doc.add_paragraph(line)
    doc.save(path)


def create_pptx_from_text(slide_pairs, path):
    prs = Presentation()
    for title, content in slide_pairs:
        slide = prs.slides.add_slide(prs.slide_layouts[1])
        slide.shapes.title.text = title
        if len(slide.shapes.placeholders) > 1:
            slide.shapes.placeholders[1].text = content
    prs.save(path)


def create_pdf_from_text(text, path):
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4
    margin = 40
    max_width = width - 2 * margin
    y = height - margin
    line_height = 16
    font_name = "Helvetica"
    font_size = 12

    c.setFont(font_name, font_size)

    paragraphs = text.split("\n")

    for para in paragraphs:
        if not para.strip():
            y -= line_height
            continue

        words = para.split()
        current_line = ""

        for word in words:
            test_line = current_line + (" " if current_line else "") + word
            if stringWidth(test_line, font_name, font_size) <= max_width:
                current_line = test_line
            else:
                if y < margin:
                    c.showPage()
                    c.setFont(font_name, font_size)
                    y = height - margin
                c.drawString(margin, y, current_line)
                y -= line_height
                current_line = word

        if current_line:
            if y < margin:
                c.showPage()
                c.setFont(font_name, font_size)
                y = height - margin
            c.drawString(margin, y, current_line)
            y -= line_height

    c.save()


def create_audio_from_text(text, path):
    try:
        print(f"[AUDIO] Generating audio at: {path}")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        tts = gTTS(text)
        tts.save(path)
        if os.path.exists(path):
            print(f"[AUDIO] Verified audio saved at: {path}")
            return True
        else:
            print(f"[AUDIO ERROR] File not found after saving at: {path}")
            return False
    except Exception as e:
        print(f"[AUDIO ERROR] Failed to create audio file: {e}")
        return False
