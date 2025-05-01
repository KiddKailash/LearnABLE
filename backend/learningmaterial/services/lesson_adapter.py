from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from dotenv import load_dotenv
load_dotenv()  # Load API key from .env

from learningmaterial.services.file_extractors import (
    extract_text_from_pdf, extract_text_from_docx, extract_text_from_pptx
)

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0.3)

# Define output schema
response_schemas = [
    ResponseSchema(name="disability", description="The student's learning need or disability being adapted for"),
    ResponseSchema(name="adapted_title", description="The adapted lesson title"),
    ResponseSchema(name="adapted_objectives", description="A list of 2-4 adapted learning objectives"),
    ResponseSchema(name="adapted_content", description="The full adapted lesson content in plain text")
]

parser = StructuredOutputParser.from_response_schemas(response_schemas)
format_instructions = parser.get_format_instructions()

# Define prompt
template = """
You are an educational assistant helping create adapted lesson materials.

Please output in the following JSON format:
{format_instructions}

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

def generate_adapted_lessons(material, students):
    """
    Given a LearningMaterials instance and a list of students,
    generate an AI-adapted lesson for each student.
    Returns: dict of {student_id: parsed_response_dict}
    """
    # 1. Extract text
    file_path = material.file.path
    if file_path.endswith(".pdf"):
        base_text = extract_text_from_pdf(file_path)
    elif file_path.endswith(".docx"):
        base_text = extract_text_from_docx(file_path)
    elif file_path.endswith(".pptx"):
        base_text = extract_text_from_pptx(file_path)
    else:
        raise ValueError("Unsupported file type")

    # 2. Generate adaptation only for students with disability_info
    adapted_lessons = {}
    for student in students:
        if not student.disability_info or student.disability_info.strip() == "":
            continue  # skip this student

        # Fill prompt
        student_prompt = prompt.format(
            disability_info=student.disability_info,
            objectives=material.objective or "",
            text=base_text
        )

        # Call LLM
        response = llm.invoke(student_prompt)

        # Parse structured output
        try:
            parsed_response = parser.parse(response.content)
            adapted_lessons[student.id] = parsed_response
        except Exception as e:
            # Log or store error per student if needed
            adapted_lessons[student.id] = {"error": str(e)}

    return adapted_lessons
