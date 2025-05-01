import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const LearningMaterialUploader = () => {
  const BACKEND = process.env.REACT_APP_SERVER_URL;

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [learningObjective, setLearningObjective] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [classList, setClassList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [materialId, setMaterialId] = useState(null);
  const [adaptedContent, setAdaptedContent] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BACKEND}/api/classes/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setClassList(data);
      }
    };
    fetchClasses();
  }, [BACKEND]);

  const handleFileClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const handleUploadMaterial = async () => {
    if (!title || !file || !learningObjective || !selectedClass) {
      alert("Please complete all fields.");
      return;
    }

    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    formData.append("objective", learningObjective);
    formData.append("class_assigned", selectedClass);

    setIsUploading(true);

    try {
      const res = await fetch(`${BACKEND}/api/learning-materials/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setMaterialId(data.id);
        alert("Material uploaded successfully!");
      } else {
        const text = await res.text();
        console.error("Upload failed:", text);
        alert("Upload failed. See console.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload error occurred. See console.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdaptMaterial = async () => {
    if (!materialId) {
      alert("Upload a material first.");
      return;
    }

    setIsAdapting(true);
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`${BACKEND}/api/learning-materials/${materialId}/adapt/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Material adapted successfully!");
        const updatedRes = await fetch(`${BACKEND}/api/learning-materials/${materialId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (updatedRes.ok) {
          const updatedMaterial = await updatedRes.json();
          setAdaptedContent(updatedMaterial.adapted_content);

          // Reset input fields
          setTitle("");
          setFile(null);
          setLearningObjective("");
          setMaterialId(null);
        }
      } else {
        const text = await res.text();
        console.error("Adaptation failed:", text);
        alert("Adaptation failed. See console.");
      }
    } catch (err) {
      console.error("Adaptation error:", err);
      alert("Error occurred. See console.");
    } finally {
      setIsAdapting(false);
    }
  };

  const handleChangeClass = () => {
    setSelectedClass("");
    setAdaptedContent("");
    setMaterialId(null);
    setTitle("");
    setFile(null);
    setLearningObjective("");
  };

  return (
    <>
      {!selectedClass ? (
        <Card sx={{ maxWidth: 500 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Select Class
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Class</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                label="Select Class"
              >
                {classList.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.class_name} – {cls.subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Upload Learning Material
          </Typography>

          <Button
            variant="outlined"
            onClick={handleChangeClass}
            sx={{ mb: 2 }}
          >
            Change Class
          </Button>

          <Card sx={{ maxWidth: 600 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
              />

              <TextField
                label="Learning Objective"
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                fullWidth
                multiline
                rows={3}
              />

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleFileClick}
                  startIcon={<UploadFileIcon />}
                >
                  {file ? file.name : "Choose File"}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept=".pdf,.doc,.docx,.txt,.pptx"
                />
              </Box>

              <Button
                variant="contained"
                onClick={handleUploadMaterial}
                disabled={isUploading}
              >
                Upload Material
              </Button>

              {isUploading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </CardContent>
          </Card>

          {materialId && !adaptedContent && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleAdaptMaterial}
                disabled={isAdapting}
              >
                {isAdapting ? "Adapting..." : "Adapt Material"}
              </Button>
            </Box>
          )}

          {adaptedContent && (
            <Card sx={{ maxWidth: 600, mt: 3 }}>
              <CardContent>
                <Typography variant="h6">Adapted Content Preview</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 1 }}>
                  {adaptedContent}
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  );
};

export default LearningMaterialUploader;
