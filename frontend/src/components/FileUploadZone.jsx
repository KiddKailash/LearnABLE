import React from "react";
import { useTheme } from "@mui/material/styles";

// MUI Components
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

// MUI Icons
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * A reusable file upload zone component that supports drag & drop
 * 
 * @param {Object} props
 * @param {File} props.file - The file object if a file is selected
 * @param {Function} props.onClick - Function to call when the zone is clicked
 * @param {Function} props.onDelete - Function to call when the delete button is clicked (optional)
 * @param {JSX.Element} props.icon - The icon to display when no file is selected
 * @param {string} props.title - The title text to display when no file is selected
 * @param {string} props.subtitle - The subtitle text to display when no file is selected
 * @param {Function} props.onDragOver - Drag over event handler (optional)
 * @param {Function} props.onDragLeave - Drag leave event handler (optional)
 * @param {Function} props.onDrop - Drop event handler (optional)
 * @param {boolean} props.isDragging - Whether the user is currently dragging a file over the zone (optional)
 * @param {Object} props.sx - Additional style properties to apply to the Paper component
 */
const FileUploadZone = ({
  file,
  onClick,
  onDelete,
  icon,
  title,
  subtitle,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragging = false,
  sx = {},
}) => {
  const theme = useTheme();

  const handleDelete = (e) => {
    if (onDelete) {
      e.stopPropagation();
      onDelete();
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        padding: theme.spacing(3),
        textAlign: "center",
        cursor: "pointer",
        borderStyle: "solid",
        borderRadius: theme.shape.borderRadius,
        borderColor: isDragging 
          ? "primary.dark" 
          : file 
            ? "success.main" 
            : "divider",
        bgcolor: file
          ? theme.palette.mode === "dark"
            ? "rgba(76, 175, 80, 0.1)"
            : "rgba(76, 175, 80, 0.05)"
          : isDragging
            ? "action.hover"
            : "background.paper",
        "&:hover": {
          bgcolor: "background.default",
          borderColor: isDragging ? "primary.dark" : "primary.main",
        },
        ...sx
      }}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {file ? (
        <Box sx={{ 
          display: "flex", 
          alignItems: "center",
          justifyContent: onDelete ? "space-between" : "center",
          p: 2
        }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: "1.5rem" }} />
            <Box>
              <Typography variant="body1">{file.name}</Typography>
              {file.size && (
                <Typography variant="caption" color="text.secondary">
                  {(file.size / 1024).toFixed(2)} KB
                  {onDelete ? "" : " - Click to change file"}
                </Typography>
              )}
            </Box>
          </Box>
          {onDelete && (
            <IconButton onClick={handleDelete}>
              <DeleteIcon color="error" />
            </IconButton>
          )}
        </Box>
      ) : (
        <Box sx={{ p: 3 }}>
          {icon}
          <Typography variant="h6" gutterBottom>
            {title || "Drag and drop your file here"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle || "Or click to browse"}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FileUploadZone; 