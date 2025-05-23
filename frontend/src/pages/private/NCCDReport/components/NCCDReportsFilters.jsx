import React from "react";

// MUI Components
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

// MUI Icons
import SearchIcon from "@mui/icons-material/SearchRounded";

const NCCDReportsFilters = ({
  nameSearch,
  statusFilter,
  studentFilter,
  students,
  onNameSearchChange,
  onStatusFilterChange,
  onStudentFilterChange,
  onClearFilters,
}) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 12, sm: 4, md: 3 }}>
        <TextField
          fullWidth
          label="Search by Student Name"
          value={nameSearch}
          onChange={(e) => onNameSearchChange(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon color="action" />,
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4, md: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="NotStart">Not Started</MenuItem>
            <MenuItem value="InProgress">In Progress</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, sm: 4, md: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Filter by Student</InputLabel>
          <Select
            value={studentFilter}
            label="Filter by Student"
            onChange={(e) => onStudentFilterChange(e.target.value)}
          >
            <MenuItem value="">All Students</MenuItem>
            {students.map((student) => (
              <MenuItem key={student.id} value={student.id}>
                {student.first_name} {student.last_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid
        size={{ xs: 12, sm: 12, md: 3 }}
        sx={{ display: "flex", justifyContent: "flex-end" }}
      >
        <Button variant="outlined" color="error" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </Grid>
    </Grid>
  );
};

export default NCCDReportsFilters;
