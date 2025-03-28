import React from "react";

// MUI Components
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import Stack from "@mui/material/Stack";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

const UpcomingEvents = ({ events }) => {
  return (
    <Card
      sx={{
        mt: 2,
        border: '2px solid #e0e0e0',
        boxShadow: 0,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6">Upcoming Events</Typography>
          <Link href="/calendar" underline="hover">
            See All
          </Link>
        </Box>

        <Stack direction="row" spacing={2}>
          {events.map((event) => (
            <Box key={event.id} sx={{ p: 1, mb: "auto" }}>
              <Typography variant="subtitle1">{event.title}</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {event.time}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;
