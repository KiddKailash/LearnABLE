import React, { useContext } from "react";

// Services
import UserContext from "../../../services/UserContext";

// Local Components
import PageWrapper from "../../../components/PageWrapper";

// MUI Components
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

// Custom Components
import DashboardAppBar from "./DashboardAppBar";
import StatsCards from "./StatsCards";
import UpcomingEvents from "./UpcomingEvents";
import WeeklySchedule from "./WeeklySchedule";

// Dummy Data
import { statsData, upcomingEventsData, weeklyScheduleData } from "./dummyData";
import { Typography } from "@mui/material";

const Dashboard = () => {
  const { user } = useContext(UserContext);

  return (
    <PageWrapper sx={{ flexGrow: 1, mt: 1 }}>
      {/* Top AppBar with Search */}
      <DashboardAppBar />

      {/* Main Content */}
      <Box fullWidth sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.name}
        </Typography>
        {/* Stats Row */}
        <StatsCards stats={statsData} />

        {/* Upcoming Events */}
        <UpcomingEvents events={upcomingEventsData} />

        {/* Weekly Schedule
        <WeeklySchedule scheduleData={weeklyScheduleData} /> */}
      </Box>
    </PageWrapper>
  );
};

export default Dashboard;
