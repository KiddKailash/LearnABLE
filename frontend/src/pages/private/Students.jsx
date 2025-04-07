import React from "react";

// Local Imports
import PageWrapper from "../../components/PageWrapper";

// MUI imports
//import Typography from "@mui/material/Typography";
import { Typography, Grid, Card, CardContent, 
  CardActions, Box, Button } from "@mui/material";

//! fake data for now--will need to update later on
//TODO: replace fake data with teacher's actual classes

const fakeClasses = [
  {id: 1, name: "7.02 English"},
  {id: 2, name: "9.06 Math"},
  {id: 3, name: "10.08 History"},
  {id: 4, name: "8.03 History"},
  {id: 5, name: "7.01 Digital Solutions"},
  {id: 5, name: "9.05 Math"},
];

const Students = () => {
  return (
    <PageWrapper>
      {/* Header section of the page */}
      <Box display = "flex" justifyContent="space-between" alignItems ="center" mb={3}>
        <Typography variant="h4">Students</Typography>
        <Button variant= "contained" color = "primary">
          Create new Class
        </Button>
      </Box>
      {/* List of classes cards */}
      <Grid container spacing={3}>
        {fakeClasses.map((classItem) => (
          <Grid item xs={12} sm ={6} md = {4} key= {classItem.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{classItem.name}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size = "small" variant = "outlined">
                  View
                </Button>
              </CardActions>
            </Card>
            </Grid>
        ))}
      </Grid>
    </PageWrapper>
  );
};

export default Students;
