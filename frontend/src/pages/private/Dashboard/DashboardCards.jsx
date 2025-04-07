import React from "react";
import { Link } from "react-router-dom";

// MUI Components
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

// Important dashboard cards that teachers can access
const cards = [
  {
    title: "AI Assistant",
    description:
      "Generate personalised learning material based on student needs with an AI assistant",
    link: "/ai-assistant",
    image: "/images/ai-assistant.png",
    textAlign: "center",
  },
  {
    title: "Students",
    description: "Access Student Information",
    link: "/students",
    image: "/images/students.png",
    textAlign: "center",
  },
  {
    //! NCCD reporting page not yet implemented, link directs user to the student page
    title: "NCCD Reporting",
    description: "Generate reports for NCCD Requirements",
    link: "/students",
    image: "/images/reporting.png",
    textAlign: "center",
  },
];

/**
 * This function renders a set of UI cards displaying the crucial links that a teacher can visit
 * Each card now includes an image at the top, followed by title and description at the bottom,
 * and a view button that links to the respective page
 * @returns {JSX.Element} rendered Dashboard cards
 */
const DashboardCards = () => {
  return (
    <Stack direction="row" spacing={4} sx={{ my: 2 }}>
      {/* Responsive grid layout for cards */}
      {cards.map((card, index) => (
        <Card
          size={4}
          key={index}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 20px rgba(0, 0, 0, 0.1)",
            },
          }}
          elevation={2}
        >
          <CardMedia
            component="img"
            image={card.image}
            alt={card.title}
            onError={(e) => {
              e.target.src = card.altImage;
            }}
            sx={{ objectFit: "cover" }}
          />

          {/* card content */}
          <CardContent>
            <Typography variant="h5" fontWeight="bold">
              {card.title}
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 1,
              }}
            >
              {card.description}
            </Typography>
            {/* view button links */}
            <Link to={card.link} style={{ textDecoration: "none", mt: "auto" }}>
              <Button
                variant="outlined"
                color="primary"
                sx={{
                  textTransform: "none",
                  borderRadius: 1.5,
                  px: 3,
                }}
              >
                View
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default DashboardCards;
