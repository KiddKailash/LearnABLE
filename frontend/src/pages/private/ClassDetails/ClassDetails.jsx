import React, { useState, useEffect, useContext } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  Link as RouterLink,
} from "react-router-dom";

// MUI Components
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

// MUI Icons
import NavigateNextIcon from "@mui/icons-material/NavigateNextRounded";

// Local Components
import StudentList from "./pages/StudentList";
import ClassContent from "./pages/LearningMaterial";
import httpClient from "../../../services/httpClient";
import studentsApi from "../../../services/studentsApi";
import classesApi from "../../../services/classesApi";
import api from "../../../services/api";
import { SnackbarContext } from "../../../contexts/SnackbarContext";

const ClassDetails = () => {
  const { classId } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "students";
  const navigate = useNavigate();
  const { showSnackbar } = useContext(SnackbarContext);
  
  // Class details state
  const [className, setClassName] = useState("");
  const [classGrade, setClassGrade] = useState("");
  
  // Students state
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  
  // Learning materials state
  const [learningMaterials, setLearningMaterials] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

  const handleAuthError = () => {
    showSnackbar("Session expired. Please log in again.", "warning");
    localStorage.clear();
    window.location.href = "/login";
  };

  // Fetch class details
  const fetchClassDetails = async () => {
    try {
      const data = await httpClient.get(`/api/students/classes/${classId}/`);
      setClassName(data.class_name || `#${classId}`);
      setClassGrade(data.year_level || "");
      return data;
    } catch (error) {
      console.error("Error fetching class details:", error);
      if (error.status === 401) handleAuthError();
      showSnackbar("Failed to fetch class details", "error");
      return null;
    }
  };

  // Fetch students for class
  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const data = await httpClient.get(`/api/students/classes/${classId}/`);
      setStudents(data.students || []);
      return data.students || [];
    } catch (error) {
      console.error("Error fetching students:", error);
      if (error.status === 401) handleAuthError();
      showSnackbar("Failed to fetch students", "error");
      return [];
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Fetch learning materials for class
  const fetchLearningMaterials = async () => {
    setIsLoadingMaterials(true);
    try {
      const data = await api.learningMaterials.getByClass(classId);
      setLearningMaterials(data || []);
      return data;
    } catch (error) {
      console.error("Error fetching learning materials:", error);
      if (error.status === 401) handleAuthError();
      showSnackbar("Failed to fetch learning materials", "error");
      return [];
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  // Delete student
  const deleteStudent = async (studentId) => {
    try {
      await studentsApi.delete(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      showSnackbar("Student deleted successfully", "success");
      return true;
    } catch (error) {
      console.error("Error deleting student:", error);
      if (error.status === 401) handleAuthError();
      showSnackbar("Failed to delete student", "error");
      return false;
    }
  };

  // Update student
  const updateStudent = async (studentId, studentData) => {
    try {
      await studentsApi.update(studentId, studentData);
      await fetchStudents();
      showSnackbar("Student updated successfully", "success");
      return true;
    } catch (error) {
      console.error("Error updating student:", error);
      if (error.status === 401) handleAuthError();
      showSnackbar("Failed to update student", "error");
      return false;
    }
  };

  // Add student to class
  const addStudentToClass = async (studentData, isNewStudent = true) => {
    try {
      // Check if student already exists in the class
      const alreadyInClass = students.some(
        (s) => s.student_email.toLowerCase() === studentData.student_email.toLowerCase()
      );

      if (alreadyInClass) {
        showSnackbar("Student already exists in this class", "warning");
        return false;
      }

      let studentId;
      
      if (isNewStudent) {
        // Create new student first
        const newStudentData = await studentsApi.create(studentData);
        studentId = newStudentData.id;
      } else {
        // Find existing student by email
        const existingStudent = await studentsApi.findByEmail(studentData.student_email);
        studentId = existingStudent.id;
      }

      // Add student to class
      await classesApi.addStudent(classId, studentId);
      await fetchStudents();
      
      showSnackbar(
        isNewStudent 
          ? "Student created and added to class" 
          : "Student added to class successfully", 
        "success"
      );
      
      return true;
    } catch (error) {
      console.error("Error adding student:", error);
      if (error.status === 401) handleAuthError();
      showSnackbar(error.message || "Error creating/adding student", "error");
      return false;
    }
  };

  // Upload CSV with students
  const uploadStudentCSV = async (formData) => {
    try {
      const result = await classesApi.uploadStudentCSV(formData);
      await fetchStudents();
      
      if (result.duplicates?.length > 0) {
        showSnackbar(
          "CSV uploaded. Some students were already in the class.",
          "warning"
        );
      } else {
        showSnackbar("CSV uploaded successfully", "success");
      }
      
      return true;
    } catch (error) {
      console.error("Error uploading CSV:", error);
      if (error.status === 401) handleAuthError();
      showSnackbar(
        `CSV upload failed: ${error.message || "Unknown error"}`,
        "error"
      );
      return false;
    }
  };

  // Create and adapt learning material
  const createLearningMaterial = async (materialData) => {
    try {
      const response = await api.learningMaterials.create(materialData);
      showSnackbar("Material uploaded successfully!", "success");
      await fetchLearningMaterials();
      return response;
    } catch (error) {
      console.error("Error creating learning material:", error);
      if (error.status === 401) handleAuthError();
      showSnackbar(error.message || "Failed to upload material", "error");
      return null;
    }
  };

  // Adapt learning material for students
  const adaptLearningMaterial = async (materialId) => {
    try {
      const response = await api.learningMaterials.adapt(materialId);
      await fetchLearningMaterials();
      return response;
    } catch (error) {
      console.error("Error adapting learning material:", error);
      if (error.status === 401) handleAuthError();
      showSnackbar(error.message || "Failed to adapt material", "error");
      return null;
    }
  };

  // Download adapted material
  const downloadAdaptedMaterial = async (materialId, studentId) => {
    try {
      return await api.learningMaterials.downloadAdapted(materialId, studentId);
    } catch (error) {
      console.error("Error downloading adapted material:", error);
      if (error.status === 401) handleAuthError();
      showSnackbar("Failed to download adapted material", "error");
      return null;
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      const classData = await fetchClassDetails();
      
      if (classData) {
        if (mode === "students") {
          await fetchStudents();
        } else if (mode === "content") {
          await fetchLearningMaterials();
        }
      }
    };
    
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, mode]);

  return (
    <>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          component={RouterLink}
          to="/dashboard"
          underline="none"
          color="inherit"
          sx={{ display: "flex", alignItems: "center" }}
        >
          Dashboard
        </Link>
        <Link
          component={RouterLink}
          to="/classes"
          underline="none"
          color="inherit"
          sx={{ display: "flex", alignItems: "center" }}
        >
          Classes
        </Link>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          {className}
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        {className === "" ? "Class Details" : `${className}, Grade ${classGrade}`}
      </Typography>

      <Box
        sx={{
          mb: 2,
          display: "flex",
          borderRadius: 2,
          p: 0.5,
        }}
      >
        <Button
          color="primary"
          onClick={() => navigate(`/classes/${classId}?mode=students`)}
          sx={{
            py: 1,
            borderRadius: 1.5,
            flex: 1,
            position: "relative",
            "&:after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: 2,
              bgcolor: "primary.main",
              opacity: mode === "students" ? 1 : 0,
              transition: "opacity 0.2s",
            },
          }}
        >
          Students
        </Button>
        <Button
          color="primary"
          onClick={() => navigate(`/classes/${classId}?mode=content`)}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 1.5,
            flex: 1,
            position: "relative",
            "&:after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: 2,
              bgcolor: "primary.main",
              opacity: mode === "content" ? 1 : 0,
              transition: "opacity 0.2s",
            },
          }}
        >
          Adapt Learning Content
        </Button>
      </Box>

      {mode === "students" ? (
        <StudentList 
          students={students}
          isLoading={isLoadingStudents}
          fetchStudents={fetchStudents}
          deleteStudent={deleteStudent}
          updateStudent={updateStudent}
          addStudentToClass={addStudentToClass}
          uploadStudentCSV={uploadStudentCSV}
        />
      ) : (
        <ClassContent 
          learningMaterials={learningMaterials}
          isLoading={isLoadingMaterials}
          fetchLearningMaterials={fetchLearningMaterials}
          createLearningMaterial={createLearningMaterial}
          adaptLearningMaterial={adaptLearningMaterial}
          downloadAdaptedMaterial={downloadAdaptedMaterial}
          classId={classId}
          students={students}
        />
      )}
    </>
  );
};

export default ClassDetails;
