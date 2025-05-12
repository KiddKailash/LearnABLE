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
    print(f"[DEBUG] Saving PPTX to: {path}")
    os.makedirs(os.path.dirname(path), exist_ok=True)

    if not slide_pairs or not isinstance(slide_pairs, list):
        print("[ERROR] No slide content or invalid format.")
        return

    prs = Presentation()
    title_font_size = Pt(36)
    content_font_size = Pt(20)

    for idx, (title, content) in enumerate(slide_pairs):
        if not title.strip() and not content.strip():
            continue

        slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout

        # Add background color
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = RGBColor(242, 242, 242)  # Light grey

        # Title shape with design
        title_box = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(0.3), Inches(9), Inches(1)
        )
        title_box.fill.solid()
        title_box.fill.fore_color.rgb = RGBColor(91, 155, 213)  # Blue
        title_box.text = title.strip()
        title_frame = title_box.text_frame
        title_frame.paragraphs[0].font.size = title_font_size
        title_frame.paragraphs[0].font.bold = True
        title_frame.paragraphs[0].font.color.rgb = RGBColor(255, 255, 255)

        # Content box
        content_box = slide.shapes.add_textbox(Inches(0.7), Inches(1.5), Inches(8), Inches(5))
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

        # Optional: Add a placeholder image based on slide index
        if idx % 2 == 0:  # Just an example
            image_path = "/path/to/your/image.png"
            if os.path.exists(image_path):
                slide.shapes.add_picture(image_path, Inches(6.5), Inches(5.5), Inches(2), Inches(1.5))

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
    heading_font_size = 16
    heading_color = Color(46/255, 116/255, 181/255)  # RGB(46, 116, 181)

    def draw_line(line, font=font_name, size=font_size):
        nonlocal y
        c.setFont(font, size)
        c.setFillColorRGB(0, 0, 0)  # Reset to black for normal text
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
            if y < margin:
                c.showPage()
                y = height - margin
            c.setFont("Helvetica-Bold", heading_font_size)
            c.setFillColor(heading_color)  # Apply blue color
            c.drawString(margin, y, title)
            y -= line_height * 1.5

        # Bullet point
        elif para.startswith("- "):
            bullet = u"\u2022 " + para[2:]
            draw_line(bullet)

        # Regular paragraph
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