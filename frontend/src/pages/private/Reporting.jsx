import React, {useState}from "react";


// Local Imports
import PageWrapper from "../../components/PageWrapper";

// MUI
import Typography from "@mui/material/Typography";
import { Container, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, Chip, Stack, Snackbar, Alert, } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

//!fake classes for teachers to select from
//TODO: replace with actual classes
const mockClasses = ['9.05 Math', '8.03 History', '7.01 Digital Solutions'];
const fakeClass = {
  '9.05 Math': [
    {name: 'John Doe', status: 'completed'},
    {name: 'Tom Curise', status: 'due'},
    {name: 'James Bond', status: 'overdue'},
  ],

  '8.03 History': [
    {name: 'Bond James', status: 'completed'},
    {name: 'Tom Tom', status: 'due'},

  ],

  '7.01 Digital Solutions': [
    {name: 'Jason Bourne', status: 'completed'},
    {name: 'Joe Mama', status: 'due'},
    {name: 'Michael Jackson', status: 'overdue'},
  ],
};

/**
 * This function returns a colour suitable when a teacher marks a student as 'completed', 'due' or 'overdue'.
 * - The returned colour strings are:
 * - success: green
 * - warning: yellow
 * - error: red
 * - default: undefined (defeault)
 *
 * @param {string} status - The status string, one of 'completed', 'due', 'overdue'.
 * @returns {string} The colour string.
 */
const statusColour = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'due':
      return 'warning';
    case 'overdue':
      return 'error';
    default:
      return 'default';
  }
};


/**
 * This function allows  a teacher/user to select a class and view its reporting status
 * Features:
 * - Dropdown to select a class and display students.
 * - Displays student status with colour-coded status
 * - Provides actions to view, download, or complete reports.
 * - Allows teachers to give feedback on students based on the success of the lesson
 * - Shows a notification to alert teachers that their repsonse has been recorded.
 */

export default function Reporting() {
  const [selectedClass, setSelectedClass] = useState('');
  const [feedback, setFeedback] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: "success"
  });
  const [highlightedRow, setHighlightedRow] = useState(null);

  
  
/**
 * This function handles the change event for class selection.
 *  Updates the state to reflect the newly selected class.
 * It also resets the feedback and highlighted row states.
 * @param {Object} event - The event object from the class selection input.
 */

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
    setFeedback({});
    setHighlightedRow(null);
  };


  /**
   * This funciton handles the feedback click for a given student.
   * Updates the state to record the feedback and highlights the student row.
   * Also sets a notification to alert the teacher that the feedback was recorded/saved.
   * @param {string} studentName - The student name.
   * @param {boolean} isPositive - Iff the feedback is positive or not.
   */
  const handleFeedback = (studentName, isPositive) => {
    setFeedback((prev) => ({ ...prev, [studentName]: isPositive ? 'positive' : 'negative' }));
    setHighlightedRow(studentName);
    // show notificaiton to teacher
    setSnackbar({ open: true, message: `Feedback for ${studentName} saved: ${isPositive ? ' Effective' : ' Not Effective'}`,
      severity: isPositive ? 'success' : 'warning' });
    
    setTimeout(() => setHighlightedRow(null), 1500); //set highlight row time
  };

  
  /**
   * Closes the snackbar when the close button is clicked.
   * Resets the snackbar state to be closed.
   */
  
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const students = selectedClass ? fakeClass[selectedClass] : [];

  return (
    <Container maxWidth = "md" sx = {{ py: 4}}>
      <Box display = "flex" justifyContent = "space-between" alignItems = "center" mb = {3}>
        <Typography variant = "h4" gutterBottom>
          NCCD Reporting
        </Typography>
      </Box>
      <FormControl fullWidth sx = {{ mb: 2 }}>
        <InputLabel> Select Class</InputLabel>
        <Select value = {selectedClass} label = "Select Class" onChange = {handleClassChange}>
          {mockClasses.map((className) => (
            <MenuItem key = {className} value = {className}>
              {className}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align = "center">Actions</TableCell>
                <TableCell align = "center">Feedback</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student, index) => {
                const isHighlighted = highlightedRow === student.name;
                return (
                  <TableRow
                    key = {index}
                    sx = {{
                      backgroundColor: isHighlighted
                        ? feedback[student.name] === 'positive'
                          ? '#e8f5e9'
                          : '#ffebee'
                        : 'inherit',
                      transition: 'background-color 0.3s ease-in-out',
                    }}
                  >
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <Chip label = {student.status} color={statusColour(student.status)} />
                    </TableCell>
                    <TableCell align = "center">
                      <Stack direction = "row" spacing = {1} justifyContent="center">
                        <Button variant = "outlined" size = "small">View</Button>
                        <Button variant = "outlined" size = "small">Download</Button>
                        {student.status !== 'completed' && (
                          <Button variant="contained" size="small">Complete Report</Button>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align = "center">
                      <Stack direction="row" spacing={1} justifyContent = "center">
                        <Button
                          variant = "outlined"
                          color = "success"
                          onClick={() => handleFeedback(student.name, true)}
                        >
                          <CheckIcon />
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleFeedback(student.name, false)}
                        >
                          <CloseIcon />
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose = {handleSnackbarClose} severity = {snackbar.severity} sx = {{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );

}


