import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import UserContext from "../services/UserObject";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const ProtectRoute = ({ children }) => {
  const { isLoggedIn, authLoading } = useContext(UserContext);

  // Wait until we finish checking login status
  if (authLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If we are not logged in, redirect
  if (!isLoggedIn) {
    return <Navigate to="/login?mode=login" replace />;
  }

  return children;
};

ProtectRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectRoute;
