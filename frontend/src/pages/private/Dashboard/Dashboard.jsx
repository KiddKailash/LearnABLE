import React, { useContext } from "react";

// Services
import UserContext from "../../../services/UserContext";

// Local Components
import PageWrapper from "../../../components/PageWrapper";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Custom Components
import DashboardAppBar from "./DashboardAppBar";
import StatsCards from "./StatsCards";
import UpcomingEvents from "./UpcomingEvents";
import WeeklySchedule from "./WeeklySchedule";

// Dummy Data
import { statsData, upcomingEventsData, weeklyScheduleData } from "./dummyData";

const Dashboard = () => {
  const { user } = useContext(UserContext);

  return (
    <PageWrapper>
      {/* Top AppBar with Search */}
      <DashboardAppBar />

      {/* Main Content */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.name.split(" ")[0]}
        </Typography>
        {/* Stats Row */}
        <StatsCards stats={statsData} />

        {/* Upcoming Events */}
        <UpcomingEvents events={upcomingEventsData} />

        {/* Weekly Schedule */}
        {/* <WeeklySchedule scheduleData={weeklyScheduleData} /> */}
      </Box>
    </PageWrapper>
  );
};

export default Dashboard;
