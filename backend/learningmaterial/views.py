from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, viewsets
from rest_framework.response import Response

from .models import LearningMaterials
from .serializers import LearningMaterialsSerializer
from .services.file_extractors import extract_text_from_pdf, extract_text_from_docx, extract_text_from_pptx
from .services.lesson_adapter import (generate_adapted_lessons, extract_text_from_pdf, 
extract_text_from_docx, extract_text_from_pptx, alignment_prompt, alignment_parser, llm)



class LearningMaterialsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing learning materials.
    """
    queryset = LearningMaterials.objects.all()
    serializer_class = LearningMaterialsSerializer
    parser_classes = (MultiPartParser, FormParser)


    from .services.lesson_adapter import (
    extract_text_from_pdf, extract_text_from_docx, extract_text_from_pptx,
    alignment_prompt, alignment_parser, llm
)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if hasattr(request.user, 'teacher'):
            data['created_by'] = request.user.teacher.id
        else:
            return Response({"error": "User is not linked to a teacher."}, status=400)

        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        instance = serializer.save()

        # Try to extract content and validate alignment
        alignment_info = None
        try:
            file_path = instance.file.path
            ext = file_path.split('.')[-1].lower()

            if ext == "pdf":
                text = extract_text_from_pdf(file_path)
            elif ext == "docx":
                text = extract_text_from_docx(file_path)
            elif ext == "pptx":
                slides = extract_text_from_pptx(file_path)
                text = "\n\n".join(
                    f"[Slide]\nTitle: {s['title']}\nContent: {s['content']}" for s in slides
                )
            else:
                raise ValueError("Unsupported file type for alignment check.")

            alignment_input = alignment_prompt.format(
                objectives=instance.objective or "",
                text=text
            )
            alignment_resp = llm.invoke(alignment_input)
            alignment_info = alignment_parser.parse(alignment_resp.content)

        except Exception as e:
            alignment_info = {
                "alignment": "error",
                "justification": f"Could not process content: {str(e)}"
            }

        response_data = serializer.data
        response_data["alignment_check"] = alignment_info

        return Response(response_data, status=201)



    @action(detail=True, methods=["post"])
    def adapt(self, request, pk=None):
        """
        Generate adapted lessons for all students in the assigned class.
        """
        material = self.get_object()
        students = material.class_assigned.students.all()
        adapted_outputs = generate_adapted_lessons(material, students, return_file=True)

        if isinstance(adapted_outputs, dict) and "error" in adapted_outputs:
            return Response(adapted_outputs, status=200)

        response = {}

        for student in students:
            result = adapted_outputs.get(student.id)
            if not result:
                continue

            if "error" in result:
                response[student.id] = {"error": result["error"]}
            else:
                response[student.id] = {
                    "first_name": student.first_name,
                    "last_name": student.last_name,
                    "file_url": result.get("file_url"),
                    "audio_url": result.get("audio_url")
                }

        return Response(response)
