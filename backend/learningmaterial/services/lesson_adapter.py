"""
Main AI adaptation pipeline for processing uploaded lesson files and tailoring them to student learning needs.
Uses LLMs to classify disabilities, generate adaptation strategies, and produce personalized content outputs.
"""

import os
import re
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from dotenv import load_dotenv
import asyncio
from django.conf import settings

from utils.encryption import decrypt
from learningmaterial.services.file_extractors import (
    extract_text_from_pdf, extract_text_from_docx, extract_text_from_pptx
)
from learningmaterial.services.file_creators import (
    create_pdf_from_text, create_docx_from_text, create_pptx_from_text, create_audio_from_text
)

load_dotenv()

# Initialize LLM (async)
llm = ChatOpenAI(model="gpt-4o", temperature=0.3)

# Define schemas
classification_schema = [
    ResponseSchema(name="category", description="Normalized disability category, e.g., visual_impairment, dyslexia, adhd."),
    ResponseSchema(name="notes", description="Any relevant notes for adaptation.")
]
strategy_schema = [
    ResponseSchema(name="steps", description="Ordered list of concrete adaptation steps to apply.")
]
adaptation_schema = [
    ResponseSchema(name="adapted_title", description="The adapted lesson title."),
    ResponseSchema(name="adapted_objectives", description="List of 2-4 adapted objectives."),
    ResponseSchema(name="adapted_content", description="Full adapted lesson content (plain text or slide blocks).")
]

alignment_schema = [
    ResponseSchema(name="alignment", description="One of: aligned, partially_aligned, not_aligned."),
    ResponseSchema(name="justification", description="Brief explanation of why the objectives match or don't.")
]


# Build parsers
class_parser = StructuredOutputParser.from_response_schemas(classification_schema)
strat_parser = StructuredOutputParser.from_response_schemas(strategy_schema)
adapt_parser = StructuredOutputParser.from_response_schemas(adaptation_schema)
alignment_parser = StructuredOutputParser.from_response_schemas(alignment_schema)


# Prompts
alignment_prompt = PromptTemplate(
    template="""
You are an education specialist.

Determine whether the following lesson objectives are aligned with the provided lesson content.

Objectives:
{objectives}

Content:
{text}

Classify the alignment as one of the following:
- aligned
- partially_aligned
- not_aligned

Output JSON:
{format_instructions}
""",
    input_variables=["objectives", "text"],
    partial_variables={"format_instructions": alignment_parser.get_format_instructions()}
)



classify_prompt = PromptTemplate(
    template="""
You are a disability classification assistant.
Given the student description:
" {disability_info} "
Identify the primary disability category and any adaptation notes.

Output JSON:
{format_instructions}
""",
    input_variables=["disability_info"],
    partial_variables={"format_instructions": class_parser.get_format_instructions()}
)



strategy_prompt = PromptTemplate(
    template="""
You are an adaptation strategist.
Based on disability category: {category}
and notes: {notes}
Generate an ordered list of concrete adaptation steps.

Output JSON:
{format_instructions}
""",
    input_variables=["category", "notes"],
    partial_variables={"format_instructions": strat_parser.get_format_instructions()}
)



adapt_prompt = PromptTemplate(
    template="""
You are an expert educational designer. Given the original lesson content and learning objectives, produce an adapted version tailored to the learners needs—with no mention that its been modified.
Please ensure that the content that is output is UDL (Universal Design for Learning) aligned and follows those guidelines as much as possible.

Given the student description:
" {disability_info} "

Disability category: {category}

Adaptation steps to apply:
{steps}

Original objectives:
{objectives}

Original lesson content:
{text}

Deliverable:
- Return only valid JSON matching this schema (no extra fields).
- Keep titles, sections and structure from the original; and just refactor the content to meet student learning needs and adapt the content according to the steps.
- Do not introduce new teaching methods or overtly call out adaptations.

JSON format:
{format_instructions}

{slide_instructions}
""",
    input_variables=["disability_info", "category", "steps", "objectives", "text", "slide_instructions"],
    partial_variables={"format_instructions": adapt_parser.get_format_instructions()}
)



def get_base_text(path: str):
    """
    Dispatch file to appropriate extractor based on extension and return extracted base text and images.
    """
    ext = path.split('.')[-1].lower()
    if ext == 'pdf':
        text, images = extract_text_from_pdf(path)
        return text, [{'images': images}]
    if ext == 'docx':
        text, images = extract_text_from_docx(path)
        return text, [{'images': images}]
    if ext == 'pptx':
        slides = extract_text_from_pptx(path)
        text = "\n\n".join(
            f"[Slide]\nTitle: {s['title']}\nContent: {s['content']}" for s in slides
        )
        return text, slides
    raise ValueError(f"Unsupported file type: {ext}")


async def process_student(material, student, base_text, file_ext, original_slides, return_file):
    """
    Processes a single student's disability information and adapts the lesson accordingly.

    This includes classification of the disability, generation of adaptation strategies,
    creation of adapted content, and optional generation of audio or output files.

    Args:
        material: The LearningMaterials instance representing the uploaded lesson.
        student: The student object containing disability information.
        base_text (str): Extracted base text from the original lesson file.
        file_ext (str): The extension of the file (pdf, docx, pptx).
        original_slides (list or None): Parsed slide data with optional image refs for PPTX.
        return_file (bool): Whether to create and store adapted output files.

    Returns:
        dict or None: A dictionary with adapted content and metadata, or None if skipped.
    """
    info = student.disability_info.strip()
    if not info:
        return None

    # 1. Classification
    cls_input = classify_prompt.format(disability_info=info)
    cls_resp = await asyncio.to_thread(llm.invoke, cls_input)
    cls = class_parser.parse(cls_resp.content)
    category = cls['category']
    notes = cls.get('notes', '')

    # 2. Visual-impairment override
    if category == 'visual_impairment':
        out_dir = os.path.join(settings.MEDIA_ROOT, 'adapted_output')
        os.makedirs(out_dir, exist_ok=True)
        fname = f"{student.first_name}_{student.last_name}_{material.title}.mp3".replace(' ', '_')
        audio_path = os.path.join(out_dir, fname)
        success = await asyncio.to_thread(create_audio_from_text, base_text, audio_path)
        return {
            'student_id': student.id,
            'disability': info,
            'category': category,
            'notes': notes,
            'adapted_title': material.title,
            'adapted_objectives': [],
            'adapted_content': '',
            'audio_url': f"{settings.MEDIA_URL}adapted_output/{fname}" if success else None,
        }

    # 3. Strategy generation
    strat_input = strategy_prompt.format(category=category, notes=notes)
    strat_resp = await asyncio.to_thread(llm.invoke, strat_input)
    strategy = strat_parser.parse(strat_resp.content)['steps']

    # 4. Lesson adaptation
    steps_list = "\n".join(f"- {s}" for s in strategy)
    slide_instructions = (
        """If the output will be used for a PowerPoint presentation (PPTX), structure the `adapted_content` field using this format:

        [Slide]
        Title: <title>
        Content: <content>
        (use double line breaks between paragraphs)

        Avoid including any generic tool tips or the original lesson content outside of slide blocks."""
        if file_ext == 'pptx' else ""
    )
    adapt_input = adapt_prompt.format(
        disability_info=info,
        category=category,
        steps=steps_list,
        objectives=material.objective or "",
        text=base_text,
        slide_instructions=slide_instructions
    )
    adapt_resp = await asyncio.to_thread(llm.invoke, adapt_input)
    parsed = adapt_parser.parse(adapt_resp.content)

    # 5. Conditional audio
    if any('audio narration' in s.lower() for s in strategy):
        out_dir = os.path.join(settings.MEDIA_ROOT, 'adapted_output')
        os.makedirs(out_dir, exist_ok=True)
        fname = f"{student.first_name}_{student.last_name}_{material.title}.mp3".replace(' ', '_')
        audio_path = os.path.join(out_dir, fname)
        await asyncio.to_thread(create_audio_from_text, base_text, audio_path)
        parsed['audio_url'] = f"{settings.MEDIA_URL}adapted_output/{fname}"

    # 6. File writing
    if return_file:
        out_dir = os.path.join(settings.MEDIA_ROOT, 'adapted_output')
        os.makedirs(out_dir, exist_ok=True)
        safe_title = material.title.replace(' ', '_').replace('/', '_')
        user_prefix = f"{student.first_name}_{student.last_name}".replace(' ', '_').lower()
        filename = f"{user_prefix}_{safe_title}.{file_ext}"
        output_path = os.path.join(out_dir, filename)
        content = parsed.get('adapted_content', '')

        if file_ext == 'pdf':
            images = original_slides[0]['images'] if original_slides else []
            await asyncio.to_thread(create_pdf_from_text, content, output_path, images=images)

        elif file_ext == 'docx':
            images = original_slides[0]['images'] if original_slides else []
            await asyncio.to_thread(create_docx_from_text, content, output_path, images=images)

        elif file_ext == 'pptx':
            slides = re.findall(
                r"\[Slide\]\s*Title:\s*(.*?)\s*Content:\s*(.*?)(?=\n\s*\[Slide\]|\Z)",
                content,
                re.DOTALL
            )
            slide_pairs = [(t.strip(), c.strip()) for t, c in slides]
            blacklist = {"Using Support Tools", "Accessing Audiobooks", "Extended Time Accommodations"}
            slide_pairs = [(t, c) for t, c in slide_pairs if t not in blacklist]
            adapted_slides = []
            for i, (title, slide_content) in enumerate(slide_pairs):
                slide_content = slide_content.replace('### Slide', '').strip()
                images = original_slides[i]['images'] if i < len(original_slides) else []
                adapted_slides.append((title, slide_content, images))

            await asyncio.to_thread(create_pptx_from_text, adapted_slides, output_path)


        parsed['file'] = output_path
        parsed['file_url'] = f"{settings.MEDIA_URL}adapted_output/{filename}"

    parsed.update({
        'student_id': student.id,
        'disability': info,
        'category': category,
        'strategy': strategy,
        'notes': notes
    })
    return parsed


async def generate_adapted_lessons(material, students, return_file=False):
    """
    Orchestrates parallel adaptation of a lesson for all students in a class.

    Executes the processing of each student concurrently using asyncio to improve speed,
    and aggregates the results keyed by student ID.

    Args:
        material: The LearningMaterials instance to adapt.
        students (list): List of student objects assigned to the material.
        return_file (bool): Whether to generate physical files (PDF/DOCX/PPTX/audio) for each.

    Returns:
        dict: A mapping of student IDs to their respective adaptation result dictionaries.
    """
    file_ext = material.file.path.split('.')[-1].lower()
    adapted_lessons = {}

    # If PPTX, extract structured data including images
    if file_ext == 'pptx':
        original_slides = extract_text_from_pptx(material.file.path)
        base_text = "\n\n".join(
            f"[Slide]\nTitle: {s['title']}\nContent: {s['content']}" for s in original_slides
        )
    else:
        base_text, original_slides = get_base_text(material.file.path)


    # Run all student adaptations concurrently
    student_tasks = [
        process_student(material, student, base_text, file_ext, original_slides, return_file)
        for student in students
        if student.disability_info.strip()
    ]

    results = await asyncio.gather(*student_tasks)

    for result in results:
        if result:
            sid = result.pop('student_id')
            adapted_lessons[sid] = result

    return adapted_lessons