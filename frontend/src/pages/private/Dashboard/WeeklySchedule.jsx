import React from "react";

// MUI
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";

const hours = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

const WeeklySchedule = ({ scheduleData }) => {
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Weekly Course Schedule
        </Typography>

        {/* Days Row */}
        <Grid container sx={{ mb: 1 }}>
          <Grid size={2} />
          {scheduleData.map((day) => (
            <Grid xs key={day.day}>
              <Typography variant="subtitle2" align="center">
                {day.day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Time Slots */}
        {hours.map((hour, index) => (
          <Grid container key={index} sx={{ mb: 2 }}>
            {/* Time Label */}
            <Grid
              item
              xs={2}
              sx={{ display: "flex", alignItems: "center", pr: 1, justifyContent: "flex-end" }}
            >
              <Typography variant="body2" color="textSecondary">
                {hour}
              </Typography>
            </Grid>

            {/* Day Columns */}
            {scheduleData.map((day) => {
              // Find if there's a class that starts at this hour
              const matchedClass = day.classes.find(
                (cls) => cls.start === hour
              );

              return (
                <Grid
                  item
                  xs
                  key={day.day}
                  sx={{
                    border: "1px solid #e0e0e0",
                    minHeight: 50,
                    position: "relative",
                  }}
                >
                  {/* If a class starts here, show it as a colored box */}
                  {matchedClass && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: matchedClass.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        borderRadius: "shape.border",
                      }}
                    >
                      <Typography variant="caption" align="center">
                        {matchedClass.title} <br />
                        {matchedClass.start} - {matchedClass.end}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              );
            })}
          </Grid>
        ))}
      </CardContent>
    </Card>
  );
};

export default WeeklySchedule;
