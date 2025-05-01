from docx import Document
from pptx import Presentation
from pptx.util import Inches, Pt
from reportlab.pdfgen import canvas

def create_docx_from_text(text, path):
    doc = Document()
    for line in text.split("\n"):
        doc.add_paragraph(line)
    doc.save(path)

def create_pptx_from_text(text, path):
    prs = Presentation()
    slide = prs.slides.add_slide(prs.slide_layouts[1])
    content = slide.shapes.title
    content.text = "Adapted Lesson"

    for chunk in text.split("\n\n"):
        slide = prs.slides.add_slide(prs.slide_layouts[1])
        body = slide.shapes.placeholders[1]
        body.text = chunk.strip()

    prs.save(path)

def create_pdf_from_text(text, path):
    c = canvas.Canvas(path)
    text_object = c.beginText(40, 800)
    text_object.setFont("Helvetica", 12)

    for line in text.split("\n"):
        text_object.textLine(line)
        if text_object.getY() < 40:
            c.drawText(text_object)
            c.showPage()
            text_object = c.beginText(40, 800)
            text_object.setFont("Helvetica", 12)

    c.drawText(text_object)
    c.save()
