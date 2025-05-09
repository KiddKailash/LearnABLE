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
import requests
from docx.shared import Pt
from docx.oxml.ns import qn
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def create_docx_from_text(text, path):
    doc = Document()
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)

    paragraphs = text.split('\n')

    for para in paragraphs:
        para = para.strip()
        if not para:
            doc.add_paragraph("")  # Blank line for spacing
            continue

        if para.startswith("Title:"):
            title_text = para.replace("Title:", "").strip()
            p = doc.add_heading(title_text, level=1)
            p.alignment = WD_PARAGRAPH_ALIGNMENT.LEFT
        elif para.startswith("Content:"):
            content_text = para.replace("Content:", "").strip()
            doc.add_paragraph(content_text)
        elif para.startswith("- "):
            doc.add_paragraph(para[2:], style='List Bullet')
        else:
            doc.add_paragraph(para)

    doc.save(path)



def create_pptx_from_text(slide_pairs, path):
    print(f"[DEBUG] Saving PPTX to: {path}")
    os.makedirs(os.path.dirname(path), exist_ok=True)

    if not slide_pairs or not isinstance(slide_pairs, list):
        print("[ERROR] No slide content or invalid format.")
        return

    prs = Presentation()
    title_font_size = Pt(36)
    content_font_size = Pt(20)

    for title, content in slide_pairs:
        if not title.strip() and not content.strip():
            continue

        slide = prs.slides.add_slide(prs.slide_layouts[1])  # Title + Content layout

        # Title text
        slide_title = slide.shapes.title
        slide_title.text = title.strip()
        slide_title.text_frame.paragraphs[0].font.size = title_font_size
        slide_title.text_frame.paragraphs[0].font.name = "Calibri"
        slide_title.text_frame.paragraphs[0].font.color.rgb = RGBColor(20, 20, 20)

        # Content text
        body_shape = slide.shapes.placeholders[1]
        text_frame = body_shape.text_frame
        text_frame.clear()

        lines = content.strip().split("\n")
        for idx, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            p = text_frame.add_paragraph() if idx != 0 else text_frame.paragraphs[0]
            p.text = line
            p.level = 0
            p.font.size = content_font_size
            p.font.name = "Calibri"
            p.font.color.rgb = RGBColor(40, 40, 40)

    if not prs.slides:
        print("[ERROR] No valid slides were added.")
        return

    prs.save(path)
    print(f"[PPTX] Saved successfully to {path}")


def create_pdf_from_text(text, path):
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4
    margin = 50
    max_width = width - 2 * margin
    y = height - margin
    line_height = 16
    font_name = "Helvetica"
    font_size = 12

    def draw_line(line, font=font_name, size=font_size):
        nonlocal y
        c.setFont(font, size)
        words = line.split()
        current_line = ""

        for word in words:
            test_line = current_line + (" " if current_line else "") + word
            if stringWidth(test_line, font, size) <= max_width:
                current_line = test_line
            else:
                if y < margin:
                    c.showPage()
                    y = height - margin
                    c.setFont(font, size)
                c.drawString(margin, y, current_line)
                y -= line_height
                current_line = word

        if current_line:
            if y < margin:
                c.showPage()
                y = height - margin
                c.setFont(font, size)
            c.drawString(margin, y, current_line)
            y -= line_height

    paragraphs = text.split("\n")
    for para in paragraphs:
        para = para.strip()
        if not para:
            y -= line_height
            continue

        # Section header
        if para.startswith("Title:"):
            title = para.replace("Title:", "").strip()
            c.setFont("Helvetica-Bold", 14)
            if y < margin:
                c.showPage()
                y = height - margin
            c.drawString(margin, y, title)
            y -= line_height * 1.5
        # Bullet point
        elif para.startswith("- "):
            bullet = u"\u2022 " + para[2:]
            draw_line(bullet)
        else:
            draw_line(para)

        y -= line_height * 0.5

    c.save()



# nova – female, natural and calm

# shimmer – female, bright and expressive

# echo – male, neutral and smooth

# onyx – male, deeper tone

# fable – male, slightly theatrical

def create_audio_from_text(text, path, voice="nova", speed=1.0):
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        url = "https://api.openai.com/v1/audio/speech"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "tts-1",
            "voice": voice,
            "input": text,
            "speed": speed
        }

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()

        with open(path, "wb") as f:
            f.write(response.content)

        print(f"[AUDIO] Audio saved at {path}")
        return True
    except Exception as e:
        print(f"[AUDIO ERROR] {e}")
        return False
