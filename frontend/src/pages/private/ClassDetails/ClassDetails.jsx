import React, { useState, useEffect } from "react";
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
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

// Local Components
import StudentList from "./pages/StudentList";
import ClassContent from "./pages/LearningMaterial";
import httpClient from "../../../services/httpClient";

const ClassDetails = () => {
  const { classId } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "students";
  const navigate = useNavigate();
  const [className, setClassName] = useState("");
  const [classGrade, setClassGrade] = useState("");

  const fetchClassDetails = async () => {
    try {
      const data = await httpClient.get(`/api/students/classes/${classId}/`);
      console.log("Data is", data);
      setClassName(data.class_name || `#${classId}`);
      setClassGrade(data.year_level || "");
    } catch (error) {
      console.error("Error fetching class details:", error);
    }
  };

  useEffect(() => {
    fetchClassDetails();
    //eslint-disable-next-line
  }, [classId]);

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

      {mode === "students" ? <StudentList /> : <ClassContent />}
    </>
  );
};

export default ClassDetails;
