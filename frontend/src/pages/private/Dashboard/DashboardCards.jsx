
import React from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button,
  Box
} from "@mui/material";

// important dashboard cards that teachers can access
const cards = [
  {
    title: "AI Assistant",
    description: "Generate personalised learning material based on student needs with an AI assistant",
    link: "/ai-assistant",
    image: "/images/ai-assistant.png",
    textAlign: "center"
  },
  {
    title: "Students",
    description: "Access Student Information",
    link: "/students",
    image: "/images/students.png",
    textAlign: "center"
  },
  {
    //! NCCD reporting page not yet implemented, link directs user to the student page
    title: "NCCD Reporting",
    description: "Generate reports for NCCD Requirements",
    link: "/students",
    image: "/images/reporting.png", 
    textAlign: "center"
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
    <Box sx={{ 
      display: "flex", 
      justifyContent: "center", 
      flexWrap: "wrap", 
      gap: 3,
      py: 2
    }}>
      {cards.map((card, index) => (
        <Card
          key={index}
          sx={{
            width: "350px",
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
          {/* card image */}
          <CardMedia
            component="img"
            height="250"
            image={card.image}
            alt={card.title}
            onError={(e) => {
              e.target.src = card.altImage;
            }}
            sx={{ objectFit: "cover" }}
          />
          
          {/* card content */}
          <CardContent sx={{ padding: 3 }}>
            <Typography 
              variant="h5" 
              component="div" 
              fontWeight="bold" 
              gutterBottom
            >
              {card.title}
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                minHeight: "60px" // Ensure consistent height for descriptions
              }}
            >
              {card.description}
            </Typography>
             {/* view button links */}
            <Link to={card.link} style={{ textDecoration: "none" }}>
              <Button 
                variant="outlined" 
                color="primary"
                sx={{ 
                  textTransform: "none",
                  borderRadius: 1.5,
                  px: 3
                }}
              >
                View
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default DashboardCards;
