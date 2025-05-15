from docx import Document
from pptx import Presentation
from pptx.util import Inches, Pt
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.lib.colors import Color
from reportlab.pdfbase.pdfmetrics import stringWidth
from gtts import gTTS
import os
import re
import requests
from docx.oxml.ns import qn
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

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
            doc.add_paragraph()
            continue
        
        # Main Title (first line)
        if para == paragraphs[0]:
            doc.add_paragraph(para, style='Title')
            continue

        # Bolded section title followed by colon (e.g. **Learning Objective:**)
        match = re.match(r"\*\*(.+?)\*\*:(.*)", para)
        if match:
            title, content = match.groups()
            p = doc.add_paragraph()
            run = p.add_run(f"{title.strip()}: ")
            run.bold = True
            run.font.size = Pt(12)
            p.add_run(content.strip())
            continue

        # Full-line subheading (e.g. **Why is Photosynthesis Important?**)
        if re.match(r"\*\*(.+?)\*\*", para) and para.endswith("**"):
            heading_text = re.findall(r"\*\*(.+?)\*\*", para)[0]
            doc.add_paragraph(heading_text, style='Heading 2')
            continue

        # Bullet list (• ...)
        if para.startswith("•"):
            line = para.lstrip("• ").strip()
            # Check if it starts with bold label (e.g. **Bold Label:** More text)
            match = re.match(r"\*\*(.+?)\*\*:(.*)", line)
            if match:
                label, rest = match.groups()
                p = doc.add_paragraph(style='List Bullet')
                run = p.add_run(f"{label.strip()}: ")
                run.bold = True
                p.add_run(rest.strip())
            else:
                doc.add_paragraph(line, style='List Bullet')
            continue

        # Equation or plain paragraph
        doc.add_paragraph(para)


    doc.save(path)



def create_pptx_from_text(slide_pairs, path):
    prs = Presentation()
    title_font_size = Pt(36)
    content_font_size = Pt(20)

    for idx, (title, content, images) in enumerate(slide_pairs):
        slide = prs.slides.add_slide(prs.slide_layouts[6])

        # Title
        title_box = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(0.3), Inches(9), Inches(1)
        )
        title_box.fill.solid()
        title_box.fill.fore_color.rgb = RGBColor(91, 155, 213)
        title_box.text = title.strip()
        title_frame = title_box.text_frame
        title_frame.paragraphs[0].font.size = title_font_size
        title_frame.paragraphs[0].font.bold = True
        title_frame.paragraphs[0].font.color.rgb = RGBColor(255, 255, 255)

        # Content
        content_box = slide.shapes.add_textbox(Inches(0.7), Inches(1.5), Inches(8), Inches(4))
        tf = content_box.text_frame
        tf.word_wrap = True
        lines = content.strip().split("\n")
        for i, line in enumerate(lines):
            if not line:
                continue
            p = tf.add_paragraph() if i != 0 else tf.paragraphs[0]
            p.text = line
            p.level = 0
            p.font.size = content_font_size
            p.font.name = "Calibri"
            p.font.color.rgb = RGBColor(50, 50, 50)

        # Add image(s)
        for i, img_path in enumerate(images or []):
            if os.path.exists(img_path):
                slide.shapes.add_picture(img_path, Inches(6.5), Inches(4.8 + i * 1.5), Inches(2), Inches(1.5))

    prs.save(path)



def create_pdf_from_text(text, path):
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4
    margin = 50
    max_width = width - 2 * margin
    y = height - margin
    line_height = 16

    font_name = "Helvetica"
    font_size = 12
    heading_font_size = 16
    subheading_font_size = 14
    label_font_size = 12
    heading_color = Color(46/255, 116/255, 181/255)  # Blue
    label_color = Color(0, 0, 0)  # Black

    def draw_line(line, font=font_name, size=font_size, color=(0, 0, 0)):
        nonlocal y
        c.setFont(font, size)
        c.setFillColorRGB(*color)
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

    for i, para in enumerate(paragraphs):
        para = para.strip()
        if not para:
            y -= line_height
            continue

        # Main title (first non-empty paragraph)
        if i == 0:
            c.setFont("Helvetica-Bold", heading_font_size + 2)
            c.setFillColor(heading_color)
            c.drawString(margin, y, para)
            y -= line_height * 2
            continue

        # Subheading (e.g., **Why Photosynthesis Matters**)
        if re.match(r"\*\*(.+?)\*\*$", para):
            heading = re.findall(r"\*\*(.+?)\*\*", para)[0]
            c.setFont("Helvetica-Bold", subheading_font_size)
            c.setFillColor(heading_color)
            c.drawString(margin, y, heading)
            y -= line_height * 1.5
            continue

        # Bold label + content (e.g., **Definition:** The process by which ...)
        match = re.match(r"\*\*(.+?)\*\*:(.*)", para)
        if match:
            label, content = match.groups()
            label = label.strip() + ": "
            content = content.strip()
            if y < margin:
                c.showPage()
                y = height - margin
            c.setFont("Helvetica-Bold", label_font_size)
            c.setFillColorRGB(0, 0, 0)
            c.drawString(margin, y, label)
            label_width = stringWidth(label, "Helvetica-Bold", label_font_size)
            c.setFont("Helvetica", font_size)
            c.drawString(margin + label_width, y, content)
            y -= line_height
            continue

        # Bullet points
        if para.startswith("•"):
            bullet = u"\u2022 " + para[1:].strip()
            draw_line(bullet)
            y -= line_height * 0.5
            continue

        # Regular paragraph
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