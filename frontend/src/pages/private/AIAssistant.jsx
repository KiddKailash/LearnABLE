import React, { useState, useEffect, useRef } from "react";

// MUI Components
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";

// MUI Icons
import UploadFileIcon from "@mui/icons-material/UploadFile";

const LearningMaterialUploader = () => {
  const BACKEND = process.env.REACT_APP_SERVER_URL;

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [learningObjective, setLearningObjective] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [classList, setClassList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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

      const contentType = res.headers.get("content-type");
      if (res.ok && contentType.includes("application/json")) {
        alert("Material uploaded successfully!");
        setTitle("");
        setFile(null);
        setLearningObjective("");
        setSelectedClass("");
      } else {
        const text = await res.text();
        console.error("Upload failed with non-JSON response:", text);
        alert("Upload failed. Check server logs.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload error occurred. See console.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Upload Learning Material
      </Typography>

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
              accept=".pdf,.doc,.docx,.txt"
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
    </>
  );
};

export default LearningMaterialUploader;
