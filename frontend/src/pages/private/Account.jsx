import React, { useState, useEffect, useContext } from "react";
import UserContext from "../../services/UserObject"; // Import UserContext

// Local Imports
import PageWrapper from "../../components/PageWrapper";

// MUI
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import Avatar from "@mui/material/Avatar";

const Account = () => {
  const { user, isLoggedIn } = useContext(UserContext); // Access user info from UserContext
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(""); // For previewing the image
  const [email, setEmail] = useState(""); // Email will be set automatically after fetching user data

  // If user is logged in, get the email from UserContext
  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email); // Set the email from context
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file)); // Generate preview URL
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!profilePic || !email) {
      alert("Please select a file to upload and ensure you're logged in.");
      return;
    }

    const formData = new FormData();
    formData.append("email", email); // Assuming email identifies the user
    formData.append("profile_pic", profilePic);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/teachers/upload-profile-pic/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Error: ${response.status}, Message: ${JSON.stringify(data)}`);
      }

      console.log("Profile picture uploaded successfully:", data);
      alert("Profile picture updated!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture.");
    }
  };

  if (!isLoggedIn) {
    return <Typography variant="h6">You must be logged in to access this page.</Typography>;
  }

  return (
    <PageWrapper>
      <Typography variant="h1">Account</Typography>
      <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
        <Avatar src={preview || "/media/profile-pics/default.png"} sx={{ width: 100, height: 100 }} />
        <Input type="file" accept="image/*" onChange={handleFileChange} required />
        <Button type="submit" variant="contained" color="primary">
          Upload Profile Picture
        </Button>
      </form>
    </PageWrapper>
  );
};

export default Account;
