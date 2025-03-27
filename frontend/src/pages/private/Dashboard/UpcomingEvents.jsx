import React from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Link,
} from "@mui/material";

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
