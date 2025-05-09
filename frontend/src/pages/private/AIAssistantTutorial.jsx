import React from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Components
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// MUI Icons
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SchoolIcon from '@mui/icons-material/School';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';

const AIAssistantTutorial = () => {
  const navigate = useNavigate();

  const handleTryNow = () => {
    navigate('/ai-assistant/upload');
  };

  const handleSkipTutorial = () => {
    navigate('/ai-assistant/upload');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper 
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          textAlign: 'center',
          backgroundColor: 'transparent'
        }}
      >
        <SmartToyIcon 
          sx={{ 
            fontSize: 64, 
            color: '#006D97',
            mb: 2 
          }} 
        />

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#2C3E50' }}>
          Welcome to the AI Assistant!
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 6 }}>
          Instantly adapt your learning materials for every student.
        </Typography>

        <Stack spacing={4} sx={{ maxWidth: 600, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SchoolIcon sx={{ color: '#006D97', fontSize: 32 }} />
            <Box textAlign="left">
              <Typography variant="h6" gutterBottom>
                Select Your Class
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose the class you want to adapt materials for.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <UploadFileIcon sx={{ color: '#006D97', fontSize: 32 }} />
            <Box textAlign="left">
              <Typography variant="h6" gutterBottom>
                Upload Learning Material
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload a PDF, DOCX, or PPTX file you want adapted.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DownloadIcon sx={{ color: '#006D97', fontSize: 32 }} />
            <Box textAlign="left">
              <Typography variant="h6" gutterBottom>
                Review & Download
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI adapts the material for each student. Download personalised versions.
              </Typography>
            </Box>
          </Box>
        </Stack>

        <Box sx={{ mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleTryNow}
            sx={{
              backgroundColor: '#006D97',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#005578'
              }
            }}
          >
            TRY NOW
          </Button>
        </Box>

        <Button
          onClick={handleSkipTutorial}
          sx={{
            mt: 2,
            color: '#87BB34',
            '&:hover': {
              backgroundColor: 'transparent',
              textDecoration: 'underline'
            }
          }}
        >
          SKIP TUTORIAL
        </Button>
      </Paper>
    </Container>
  );
};

export default AIAssistantTutorial; 