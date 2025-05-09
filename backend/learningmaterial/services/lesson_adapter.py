import os
import re
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from dotenv import load_dotenv
from django.conf import settings
from utils.encryption import decrypt

from learningmaterial.services.file_extractors import (
    extract_text_from_pdf, extract_text_from_docx, extract_text_from_pptx
)
from learningmaterial.services.file_creators import (
    create_pdf_from_text, create_docx_from_text, create_pptx_from_text, create_audio_from_text
)

load_dotenv()

llm = ChatOpenAI(model="gpt-4o", temperature=0.3)

response_schemas = [
    ResponseSchema(name="disability", description="The student's learning need or disability being adapted for"),
    ResponseSchema(name="adapted_title", description="The adapted lesson title"),
    ResponseSchema(name="adapted_objectives", description="A list of 2-4 adapted learning objectives"),
    ResponseSchema(name="adapted_content", description="The full adapted lesson content in plain text")
]

parser = StructuredOutputParser.from_response_schemas(response_schemas)
format_instructions = parser.get_format_instructions()

template = """
You are an educational assistant helping create adapted lesson materials.

Please output in the following JSON format:
{format_instructions}

---

If this is a PowerPoint lesson, you MUST return each slide in the following format **exactly**:

[Slide]
Title: <Slide title>
Content: <Slide body text that appears on the slide)

Use **double line breaks between slides**. Do not include any explanation or headings outside of this format.

Example:

[Slide]
Title: Introduction to Energy
Content: Energy is the ability to do work. It exists in many forms, such as light, heat, and motion.

[Slide]
Title: Forms of Energy
Content: Common forms of energy include kinetic energy, potential energy, thermal energy, and more.

---

Student need: {disability_info}
Original objectives: {objectives}
Lesson content:
{text}
"""

prompt = PromptTemplate(
    input_variables=["disability_info", "objectives", "text"],
    partial_variables={"format_instructions": format_instructions},
    template=template
)

def generate_adapted_lessons(material, students, return_file=False):
    file_path = material.file.path
    file_ext = file_path.split(".")[-1].lower()

    if file_ext == "pdf":
        base_text = extract_text_from_pdf(file_path)
    elif file_ext == "docx":
        base_text = extract_text_from_docx(file_path)
    elif file_ext == "pptx":
        slide_texts = extract_text_from_pptx(file_path)
        base_text = "\n\n".join(txt for txt in slide_texts)
    else:
        raise ValueError("Unsupported file type")

    adapted_lessons = {}

    for student in students:
        disability_info = student.disability_info

        if not disability_info.strip():
            continue

        print(f"Student: {student.first_name} {student.last_name}, Disability: {disability_info}")
        is_blind = any(term in disability_info.lower() for term in ["blind", "visually impaired", "low vision"])

        if is_blind:
            # Only generate audio from original content
            output_dir = os.path.join(settings.MEDIA_ROOT, "adapted_output")
            os.makedirs(output_dir, exist_ok=True)

            title_safe = material.title.replace(" ", "_").replace("/", "_")
            first_last = f"{student.first_name}_{student.last_name}".replace(" ", "_").lower()
            audio_filename = f"{first_last}_{title_safe}.mp3"
            audio_path = os.path.join(output_dir, audio_filename)

            success = create_audio_from_text(base_text, audio_path)
            if success:
                print(f"Audio created at {audio_path}")
                adapted_lessons[student.id] = {
                    "disability": disability_info,
                    "adapted_title": material.title,
                    "adapted_objectives": [],
                    "adapted_content": "",
                    "file": None,
                    "file_url": None,
                    "audio": audio_path,
                    "audio_url": f"{settings.MEDIA_URL}adapted_output/{audio_filename}"
                }
            else:
                print(f"Audio creation failed for {student.first_name} {student.last_name}")
                adapted_lessons[student.id] = {"error": "Audio generation failed"}
            continue  # Skip rest of loop for blind students

        # Proceed with LLM adaptation for non-blind students
        student_prompt = prompt.format(
            disability_info=disability_info,
            objectives=material.objective or "",
            text=base_text
        )

        response = llm.invoke(student_prompt)

        try:
            parsed_response = parser.parse(response.content)
            adapted_lessons[student.id] = parsed_response

            if return_file:
                adapted_text = parsed_response["adapted_content"]
                output_dir = os.path.join(settings.MEDIA_ROOT, "adapted_output")
                os.makedirs(output_dir, exist_ok=True)

                title_safe = material.title.replace(" ", "_").replace("/", "_")
                first_last = f"{student.first_name}_{student.last_name}".replace(" ", "_").lower()
                filename = f"{first_last}_{title_safe}.{file_ext}"
                output_path = os.path.join(output_dir, filename)

                if file_ext == "pdf":
                    create_pdf_from_text(adapted_text, output_path)
                elif file_ext == "docx":
                    create_docx_from_text(adapted_text, output_path)
                elif file_ext == "pptx":
                    # Use improved regex to extract slide chunks
                    slides = re.findall(
                        r"\[Slide\]\s*Title:\s*(.*?)\s*Content:\s*(.*?)(?=\n\s*\[Slide\]|\Z)",
                        adapted_text,
                        re.DOTALL
                    )
                    slide_chunks = [(title.strip(), content.strip()) for title, content in slides]

                    if not slide_chunks:
                        print("[ERROR] No slide chunks extracted from adapted text.")
                        print("[DEBUG] Adapted text:\n", adapted_text)
                        adapted_lessons[student.id] = {"error": "Adapted content did not contain valid slide format."}
                        continue

                    # Generate and save PowerPoint file
                    create_pptx_from_text(slide_chunks, output_path)

                parsed_response["file"] = output_path
                parsed_response["file_url"] = f"{settings.MEDIA_URL}adapted_output/{filename}"

        except Exception as e:
            adapted_lessons[student.id] = {"error": str(e)}

    return adapted_lessons