/**
 * @file Chatbar.jsx
 * @description Chat interface combining session/file logic with a clean, minimal sidebar‑free design.
 */

import React, { useState, useEffect, useRef, useContext } from "react";
import UserContext from "../services/UserObject";

// MUI Components
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";

// MUI Icons
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import RefreshIcon from "@mui/icons-material/Refresh";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

const Chatbar = ({ apiUrlOverride, modelOverride }) => {
  const { user } = useContext(UserContext);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lastResponse, setLastResponse] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  const BACKEND = apiUrlOverride || process.env.REACT_APP_SERVER_URL;
  const MAX_MESSAGES_PER_CHAT = 10;

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chatSessions");
    if (saved) setChatSessions(JSON.parse(saved));
  }, []);
  // Persist sessions
  useEffect(() => {
    localStorage.setItem("chatSessions", JSON.stringify(chatSessions));
  }, [chatSessions]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createNewChat = () => {
    const sess = {
      id: Date.now(),
      title: "New Chat",
      timestamp: new Date().toISOString(),
      messages: [],
    };
    setChatSessions((prev) => [sess, ...prev]);
    setCurrentSessionId(sess.id);
    setMessages([]);
  };

  const handleFileClick = () => fileInputRef.current.click();
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) handleSend(file);
  };

  const handleSend = async (file = null) => {
    if ((!input.trim() && !file) || isLoading) return;

    if (!currentSessionId) {
      createNewChat();
    }

    const content = file ? `Uploaded file: ${file.name}` : input.trim();
    const userMsg = {
      type: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    const currentSess = chatSessions.find((s) => s.id === currentSessionId);
    const newMsgs = [...(currentSess?.messages || []), userMsg];

    if (newMsgs.length >= MAX_MESSAGES_PER_CHAT * 2) {
      createNewChat();
    }

    setMessages(newMsgs);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND}/api/ask-openai/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: file ? undefined : content,
          file: file ? file : undefined,
        }),
      });
      if (!res.ok) throw new Error(`${res.statusText}`);
      const data = await res.json();
      const aiMsg = {
        type: "ai",
        content: data.response || "(No response)",
        timestamp: new Date().toISOString(),
      };
      const all = [...newMsgs, aiMsg];
      setMessages(all);
      setLastResponse(aiMsg);
      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId ? { ...s, messages: all } : s
        )
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { type: "ai", content: `Error: ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateResponse = async () => {
    if (!lastResponse) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.type === "user");
    if (!lastUserMsg) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/ask-openai/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: lastUserMsg.content }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const aiMsg = {
        type: "ai",
        content: data.response || "(No response)",
        timestamp: new Date().toISOString(),
      };
      const all = [...messages, aiMsg];
      setMessages(all);
      setLastResponse(aiMsg);
      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId ? { ...s, messages: all } : s
        )
      );
    } catch {
      alert("Cannot regenerate response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeDislike = (idx, action) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === idx && m.type === "ai" ? { ...m, feedback: action } : m
      )
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        width: 360,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Message history */}
      <List sx={{ flexGrow: 1, overflowY: "auto", p: 1 }}>
        {messages.length === 0 && (
          <ListItem>
            <ListItemText
              primary="Start a conversation..."
              secondary={user?.first_name || "You"}
            />
          </ListItem>
        )}
        {messages.map((msg, idx) => (
          <React.Fragment key={idx}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={msg.content}
                secondary={msg.type === "user" ? "You" : "Assistant"}
              />
            </ListItem>
            {msg.type === "ai" && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  pr: 2,
                  mb: 1,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleLikeDislike(idx, "like")}
                  color={msg.feedback === "like" ? "primary" : "default"}
                >
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleLikeDislike(idx, "dislike")}
                  color={msg.feedback === "dislike" ? "primary" : "default"}
                >
                  <ThumbDownIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </React.Fragment>
        ))}
        <div ref={bottomRef} />
      </List>

      {/* Regenerate button */}
      {lastResponse && (
        <Box sx={{ textAlign: "center", mb: 1 }}>
          <IconButton onClick={handleRegenerateResponse}>
            <RefreshIcon /> Regenerate
          </IconButton>
        </Box>
      )}

      <Divider sx={{ width: "90%", mx: "auto" }} />

      {/* Input area */}
      <Box sx={{ display: "flex", flexDirection: "row", p: 2, gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <IconButton
            onClick={handleFileClick}
            disabled={isLoading}
            size="large"
          >
            <AttachFileIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            size="large"
          >
            {!isLoading ? <SendIcon /> : <CircularProgress size={24} />}
          </IconButton>
        </Box>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.txt"
        />
      </Box>
    </Box>
  );
};

export default Chatbar;
