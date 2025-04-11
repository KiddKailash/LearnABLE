import React, { useContext } from "react";

// Services
import UserContext from "../../../services/UserContext";

// Local Components
import PageWrapper from "../../../components/PageWrapper";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Custom Components
import DashboardAppBar from "../../../components/Appbar/AppBar";
import StatsCards from "./StatsCards";
import UpcomingEvents from "./DashboardCards";
// import WeeklySchedule from "./WeeklySchedule"; // Uncomment if needed

// Dummy Data
import { statsData, upcomingEventsData /*, weeklyScheduleData*/ } from "./dummyData";
import DashboardCards from "./DashboardCards";

const Dashboard = ({ mode, toggleTheme }) => {
  const { user } = useContext(UserContext);

  return (
    <PageWrapper>
      {/* Main Content */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.first_name}
        </Typography>
        
        {/* Stats Row */}
        <StatsCards stats={statsData} />

        {/* Upcoming Events */}
        {/*<UpcomingEvents events={upcomingEventsData} />*/}

        {/* Weekly Schedule */}
        {/* <WeeklySchedule scheduleData={weeklyScheduleData} /> */}

        <DashboardCards />
      </Box>
    </PageWrapper>
  );
};

export default Dashboard;
