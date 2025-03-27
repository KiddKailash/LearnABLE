import React from "react";

// MUI Components
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";

const StatsCards = ({ stats }) => {
  return (
    <Grid container spacing={2} sx={{width: '100%'}}>
      {stats.map((item, index) => (
        <Grid size={{xs: 12, sm:4, md:3}} key={index}>
          <Card sx={{ textAlign: "center", bgcolor: "background.default", borderRadius: "shape.border" }}>
            <CardContent>
              <Typography variant="h6" component="div">
                {item.label}
              </Typography>
              <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                {item.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;
