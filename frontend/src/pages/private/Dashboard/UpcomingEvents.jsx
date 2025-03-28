import React from "react";

// MUI Components
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

const UpcomingEvents = ({ events }) => {
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6">Upcoming Events</Typography>
          <Link href="#" underline="hover">
            See All
          </Link>
        </Box>

        <List>
          {events.map((event) => (
            <ListItem key={event.id} disablePadding sx={{ mb: 1 }}>
              <ListItemText
                primary={
                  <Typography variant="subtitle1">{event.title}</Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {event.time}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;
