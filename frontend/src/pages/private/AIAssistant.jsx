import React, { useState, useEffect, useRef } from "react";

// Local Imports
import PageWrapper from "../../components/PageWrapper";

// MUI
import {
  Typography,
  Box,
  TextField,
  IconButton,
  Card,
  CardContent,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ChatIcon from '@mui/icons-material/Chat';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lastResponse, setLastResponse] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const MAX_MESSAGES_PER_CHAT = 10; // Define maximum messages per chat
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Load chat sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem("chatSessions");
    if (savedSessions) {
      setChatSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Create new chat session
  const createNewChat = () => {
    const newSession = {
      id: Date.now(),
      title: "New Chat",
      timestamp: new Date().toISOString(),
      messages: []
    };
    
    // Update state with new session
    setChatSessions(prev => {
      const newSessions = [newSession, ...prev];
      localStorage.setItem("chatSessions", JSON.stringify(newSessions));
      return newSessions;
    });
    
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setInput("");
  };

  // Update the useEffect for saving chat sessions
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem("chatSessions", JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleSend(file);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleSend = async (file = null) => {
    // If no file and no text input, return
    if (!input.trim() && !file) return;

    // Create new session if none exists
    if (!currentSessionId) {
      const newSession = {
        id: Date.now(),
        title: "New Chat",
        timestamp: new Date().toISOString(),
        messages: []
      };
      setCurrentSessionId(newSession.id);
      setChatSessions(prev => [newSession, ...prev]);
    }

    // Create user message based on whether it's a file or text
    const newMessage = {
      type: "user",
      content: file ? `Uploaded file: ${file.name}` : input,
      timestamp: new Date().toISOString(),
    };

    // Get current session's messages
    const currentSession = chatSessions.find(session => session.id === currentSessionId);
    const currentMessages = [...(currentSession?.messages || [])];

    // Check message limit
    if (currentMessages.length >= MAX_MESSAGES_PER_CHAT * 2) {
      alert("This chat has reached its message limit. Creating a new chat...");
      createNewChat();
      return;
    }

    // Add new message to current messages
    const updatedMessages = [...currentMessages, newMessage];

    // Create AI response based on whether it's a file upload or text prompt
    const aiResponse = {
      type: "ai",
      content: file 
        ? `I've received your file "${file.name}". I can help you create personalized learning materials based on this document. What specific type of learning material would you like me to generate?`
        : "This is a placeholder AI response.",
      timestamp: new Date().toISOString(),
    };

    const finalMessages = [...updatedMessages, aiResponse];

    // Update state
    setMessages(finalMessages);
    setInput("");
    setLastResponse(aiResponse);
    
    // Update sessions with final messages
    setChatSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { ...session, messages: finalMessages }
        : session
    ));
  };

  const handleRegenerateResponse = () => {
    if (!lastResponse) return;
    // TODO: Implement regeneration logic
  };

  const handleLikeDislike = (messageIndex, action) => {
    setMessages(prev => prev.map((msg, idx) => {
      if (idx === messageIndex && msg.type === 'ai') {
        return {
          ...msg,
          feedback: action
        };
      }
      return msg;
    }));
  };

  const handleDeleteChat = (sessionId, event) => {
    event.stopPropagation(); // Prevent triggering the ListItemButton click
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  // Update the session selection handler
  const handleSessionSelect = (sessionId) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages || []);
    }
  };

  // Add this function to filter chat sessions
  const filteredChatSessions = chatSessions.filter(session => {
    const firstMessage = session.messages?.[0]?.content || "New Chat";
    return firstMessage.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <PageWrapper>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 3 
      }}>
        <img 
          src="/images/ai-icon.png"  // Updated path relative to public folder
          alt="AI Assistant Icon"
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'contain'
          }}
        />
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          AI Assistant
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, height: "calc(100vh - 160px)" }}>
        {/* Chat History Sidebar */}
        {sidebarOpen && (
          <Card sx={{ width: 260, height: '100%', overflow: 'hidden' }}>
            <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Sidebar Header */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 1,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'primary.main',
                color: 'white'
              }}>
                <IconButton 
                  onClick={() => setSidebarOpen(false)}
                  sx={{ color: 'white' }}
                >
                  <MenuOpenIcon />
                </IconButton>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    onClick={() => setSearchOpen(!searchOpen)}
                    sx={{ color: 'white' }}
                  >
                    <SearchIcon />
                  </IconButton>
                  <IconButton 
                    onClick={createNewChat}
                    sx={{ color: 'white' }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Search TextField */}
              {searchOpen && (
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ p: 1 }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'primary.main', mr: 1 }} />
                  }}
                />
              )}
              
              <List sx={{ overflow: 'auto', flexGrow: 1 }}>
                {filteredChatSessions.map((session) => (
                  <React.Fragment key={session.id}>
                    <ListItemButton
                      selected={currentSessionId === session.id}
                      onClick={() => handleSessionSelect(session.id)}
                      sx={{ 
                        py: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        '&:hover .delete-icon': {
                          opacity: 1,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'hidden' }}>
                        <ChatIcon sx={{ mr: 1, fontSize: 20 }} />
                        <ListItemText 
                          primary={session.messages?.[0]?.content?.slice(0, 30) || "New Chat"} 
                          secondary={new Date(session.timestamp).toLocaleDateString()}
                          primaryTypographyProps={{ 
                            noWrap: true,
                            fontSize: 14
                          }}
                        />
                      </Box>
                      <IconButton 
                        size="small"
                        className="delete-icon"
                        onClick={(e) => handleDeleteChat(session.id, e)}
                        sx={{ 
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'error.main',
                          },
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </ListItemButton>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Add Collapse Sidebar Button when sidebar is closed */}
        {!sidebarOpen && (
          <IconButton 
            onClick={() => setSidebarOpen(true)}
            sx={{ 
              position: 'absolute', 
              left: 0,
              top: 80,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            <MenuOpenIcon sx={{ transform: 'rotate(180deg)' }} />
          </IconButton>
        )}

        {/* Main Chat Area */}
        <Card sx={{ 
          flexGrow: 1, 
          height: '100%', 
          display: "flex", 
          flexDirection: "column",
          ml: !sidebarOpen ? 4 : 0 // Add margin when sidebar is closed
        }}>
          <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            {/* Chat History */}
            <Box sx={{ 
              flexGrow: 1, 
              overflow: "auto", 
              mb: 2,
              position: 'relative', // Add this for absolute positioning of watermark
            }}>
              {/* Add LearnAble watermark */}
              {messages.length === 0 && (
                <Typography
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'rgba(0, 0, 0, 0.1)',
                    fontSize: '48px',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  LearnABLE
                </Typography>
              )}
              
              {messages.map((message, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: message.type === "ai" ? "grey.100" : "primary.light",
                    color: message.type === "ai" ? "text.primary" : "common.white",
                  }}
                >
                  <Typography>{message.content}</Typography>
                  {message.type === "ai" && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
                      <IconButton 
                        size="small"
                        onClick={() => handleLikeDislike(index, 'like')}
                        color={message.feedback === 'like' ? 'primary' : 'default'}
                      >
                        <ThumbUpIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleLikeDislike(index, 'dislike')}
                        color={message.feedback === 'dislike' ? 'primary' : 'default'}
                      >
                        <ThumbDownIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>

            {/* Regenerate Response Button */}
            {lastResponse && (
              <Button
                startIcon={<RefreshIcon />}
                onClick={handleRegenerateResponse}
                sx={{ mb: 2, alignSelf: "center" }}
              >
                Regenerate response
              </Button>
            )}

            {/* Input Area */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                flexGrow: 1, 
                position: 'relative',
                alignItems: 'center' 
              }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="How can I assist you with creating learning content?"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <IconButton 
                  onClick={handleFileClick}
                  sx={{ 
                    position: 'absolute',
                    right: 8,
                    color: 'action.active',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  <AttachFileIcon />
                </IconButton>
              </Box>
              <IconButton color="primary" onClick={handleSend}>
                <SendIcon />
              </IconButton>
            </Box>

            {/* Add hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"  // Specify accepted file types
            />

            {/* Add loading indicator */}
            {isLoading && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 1,
              }}>
                <CircularProgress />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </PageWrapper>
  );
};

export default AIAssistant;
