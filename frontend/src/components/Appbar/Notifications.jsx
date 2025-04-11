import React from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Badge } from "@mui/material";

//! This is a dummy function, functionality of notifications not yet implemented
//TODO: implement funcitonality of notifications 

/**
 * Component that shows the notification count.
 * Number is fixed at a dummy number.
 */
export default function Notifications() {

    return (
        < Badge badgeContent={7} color="primary">
            <NotificationsIcon color = "action" />
        </Badge>
    )
}
