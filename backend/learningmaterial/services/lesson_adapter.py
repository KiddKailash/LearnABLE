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

# Initialize LLM
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
validation_schema = [
    ResponseSchema(name="suitability", description="One of: suitable, partially_suitable, not_suitable."),
    ResponseSchema(name="explanation", description="Brief explanation of why the adaptation is or isn't suitable for the student and objectives.")
]

# Build parsers
class_parser = StructuredOutputParser.from_response_schemas(classification_schema)
strat_parser = StructuredOutputParser.from_response_schemas(strategy_schema)
adapt_parser = StructuredOutputParser.from_response_schemas(adaptation_schema)
alignment_parser = StructuredOutputParser.from_response_schemas(alignment_schema)
validation_parser = StructuredOutputParser.from_response_schemas(validation_schema)

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

Provide a brief justification.

Output JSON:
{format_instructions}
""",
    input_variables=["objectives", "text"],
    partial_variables={"format_instructions": alignment_parser.get_format_instructions()}
)

fix_alignment_prompt = PromptTemplate(
    template="""
You are an educational content designer.

The following lesson content does not match the listed objectives.

Please regenerate new lesson content that fully aligns with the objectives.

Objectives:
{objectives}

---

Generate new lesson content (in the same general format as the original):

Output:
""",
    input_variables=["objectives"]
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
You are an educational assistant creating adapted lesson materials.

Category: {category}
Adaptation steps:
{steps}
Original objectives: {objectives}
Lesson content:
{text}

Output only the adapted lesson as JSON using the format below. Do not restate or summarize the original content.

Output JSON:
{format_instructions}

---

{slide_instructions}
""",
    input_variables=["category", "steps", "objectives", "text", "slide_instructions"],
    partial_variables={"format_instructions": adapt_parser.get_format_instructions()}
)

validation_prompt = PromptTemplate(
    template="""
You are an expert in inclusive education reviewing a lesson adaptation.

Student's disability category: {category}
Adaptation strategy: {steps}
Original objectives:
{objectives}

Adapted lesson content:
{adapted_content}

Does the adapted lesson appropriately meet the student's needs and align with the original objectives?

Classify as:
- suitable
- partially_suitable
- not_suitable

Output JSON:
{format_instructions}
""",
    input_variables=["category", "steps", "objectives", "adapted_content"],
    partial_variables={"format_instructions": validation_parser.get_format_instructions()}
)

# Utility to extract raw text
def get_base_text(path: str) -> str:
    ext = path.split('.')[-1].lower()
    if ext == 'pdf':
        return extract_text_from_pdf(path)
    if ext == 'docx':
        return extract_text_from_docx(path)
    if ext == 'pptx':
        slides = extract_text_from_pptx(path)
        return "\n\n".join(f"[Slide]\nTitle: {s['title']}\nContent: {s['content']}" for s in slides)
    raise ValueError(f"Unsupported file type: {ext}")

# Main pipeline
def generate_adapted_lessons(material, students, return_file=False):
    file_ext = material.file.path.split('.')[-1].lower()
    adapted_lessons = {}

    # If PPTX, extract structured data including images
    if file_ext == 'pptx':
        original_slides = extract_text_from_pptx(material.file.path)
        base_text = "\n\n".join(f"[Slide]\nTitle: {s['title']}\nContent: {s['content']}" for s in original_slides)
    else:
        base_text = get_base_text(material.file.path)

    # Alignment validation
    alignment_input = alignment_prompt.format(objectives=material.objective or "", text=base_text)
    alignment_resp = llm.invoke(alignment_input)
    alignment_result = alignment_parser.parse(alignment_resp.content)

    if alignment_result['alignment'] == 'not_aligned':
        print("⚠️ Content not aligned. Regenerating...")
        regen_input = fix_alignment_prompt.format(objectives=material.objective or "")
        regen_resp = llm.invoke(regen_input)
        base_text = regen_resp.content.strip()

        # Re-check alignment after regeneration
        alignment_input = alignment_prompt.format(objectives=material.objective or "", text=base_text)
        alignment_resp = llm.invoke(alignment_input)
        alignment_result = alignment_parser.parse(alignment_resp.content)

        if alignment_result['alignment'] == 'not_aligned':
            return {
                "alignment_check": alignment_result,
                "error": "regenerated_content_still_misaligned"
            }

    for student in students:
        info = student.disability_info.strip()
        if not info:
            continue

        # 1. Classification
        cls_input = classify_prompt.format(disability_info=info)
        cls_resp = llm.invoke(cls_input)
        cls = class_parser.parse(cls_resp.content)
        category = cls['category']
        notes = cls.get('notes', '')

        # 2. Visual-impairment override
        if category == 'visual_impairment':
            out_dir = os.path.join(settings.MEDIA_ROOT, 'adapted_output')
            os.makedirs(out_dir, exist_ok=True)
            fname = f"{student.first_name}_{student.last_name}_{material.title}.mp3".replace(' ', '_')
            audio_path = os.path.join(out_dir, fname)
            success = create_audio_from_text(base_text, audio_path)
            adapted_lessons[student.id] = {
                'disability': info,
                'category': category,
                'notes': notes,
                'adapted_title': material.title,
                'adapted_objectives': [],
                'adapted_content': '',
                'audio_url': f"{settings.MEDIA_URL}adapted_output/{fname}" if success else None,
            }
            continue

        # 3. Strategy generation
        strat_input = strategy_prompt.format(category=category, notes=notes)
        strat_resp = llm.invoke(strat_input)
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
            category=category,
            steps=steps_list,
            objectives=material.objective or "",
            text=base_text,
            slide_instructions=slide_instructions
        )
        adapt_resp = llm.invoke(adapt_input)
        parsed = adapt_parser.parse(adapt_resp.content)

        # 5. Validate adaptation suitability
        validation_input = validation_prompt.format(
            category=category,
            steps=steps_list,
            objectives=material.objective or "",
            adapted_content=parsed.get('adapted_content', '')
        )
        validation_resp = llm.invoke(validation_input)
        validation_result = validation_parser.parse(validation_resp.content)

        if validation_result.get("suitability", "").lower() == "not_suitable":
            adapted_lessons[student.id] = {
                "disability": info,
                "category": category,
                "notes": notes,
                "error": "adaptation_unsuitable",
                "validation": validation_result
            }
            continue

        parsed["validation"] = validation_result

        # 6. Optional audio generation
        if any("audio narration" in s.lower() for s in strategy):
            out_dir = os.path.join(settings.MEDIA_ROOT, 'adapted_output')
            os.makedirs(out_dir, exist_ok=True)
            fname = f"{student.first_name}_{student.last_name}_{material.title}.mp3".replace(' ', '_')
            audio_path = os.path.join(out_dir, fname)
            create_audio_from_text(base_text, audio_path)
            parsed['audio_url'] = f"{settings.MEDIA_URL}adapted_output/{fname}"

        # 7. Optional file output
        if return_file:
            out_dir = os.path.join(settings.MEDIA_ROOT, 'adapted_output')
            os.makedirs(out_dir, exist_ok=True)
            safe_title = material.title.replace(' ', '_').replace('/', '_')
            user_prefix = f"{student.first_name}_{student.last_name}".replace(' ', '_').lower()
            filename = f"{user_prefix}_{safe_title}.{file_ext}"
            output_path = os.path.join(out_dir, filename)
            content = parsed.get('adapted_content', '')

            if file_ext == 'pdf':
                create_pdf_from_text(content, output_path)
            elif file_ext == 'docx':
                create_docx_from_text(content, output_path)
            elif file_ext == 'pptx':
                slides = re.findall(
                    r"\[Slide\]\s*Title:\s*(.*?)\s*Content:\s*(.*?)(?=\n\s*\[Slide\]|\Z)",
                    content, re.DOTALL
                )
                slide_pairs = [(t.strip(), c.strip()) for t, c in slides]

                # Filter out generic support slides
                blacklist = {"Using Support Tools", "Accessing Audiobooks", "Extended Time Accommodations"}
                slide_pairs = [(t, c) for t, c in slide_pairs if t not in blacklist]

                adapted_slides = []
                for i, (title, slide_content) in enumerate(slide_pairs):
                    slide_content = slide_content.replace("### Slide", "").strip()
                    images = original_slides[i]['images'] if i < len(original_slides) else []
                    adapted_slides.append((title, slide_content, images))

                create_pptx_from_text(adapted_slides, output_path)

            parsed['file'] = output_path
            parsed['file_url'] = f"{settings.MEDIA_URL}adapted_output/{filename}"

        # 8. Final results
        parsed.update({
            'disability': info,
            'category': category,
            'strategy': strategy,
            'notes': notes
        })
        adapted_lessons[student.id] = parsed

    return adapted_lessons
