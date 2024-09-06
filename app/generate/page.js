"use client";

import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CardActionArea,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  useTheme,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, writeBatch, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [dialogOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("api/generate", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setFlashcards(data);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      alert("An error occurred while generating flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const saveFlashcards = async () => {
    if (!name) {
      alert("Please enter a name");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.id);
      const userDocSnap = await getDoc(userDocRef);

      const batch = writeBatch(db);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const updatedSets = [...(userData.flashcardsSets || []), { name }];
        batch.update(userDocRef, { flashcardsSets: updatedSets });
      } else {
        batch.set(userDocRef, { flashcardsSets: [{ name }] });
      }

      const setDocRef = doc(db, "users", user.id, "flashcardSets", name);
      batch.set(setDocRef, { flashcards });

      await batch.commit();
      alert("Flashcards saved");
      handleCloseDialog();
      setName("");
    } catch (error) {
      console.error("Error saving flashcards: ", error);
      alert("An error occurred while saving flashcards");
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          ></IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Flashcard Generator
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box
          sx={{
            mt: 4,
            mb: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h3" m={5}>
            Generate Flashcards
          </Typography>
          <Paper
            sx={{
              p: 4,
              width: "100%",
              backgroundColor: theme.palette.background.default,
              boxShadow: 4,
            }}
          >
            <TextField
              value={text}
              onChange={(e) => setText(e.target.value)}
              label="Enter text to generate flashcards"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              fullWidth
              disabled={loading}
              startIcon={loading && <CircularProgress size={16} />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                mt: 1,
                backgroundColor: loading
                  ? theme.palette.action.disabled
                  : theme.palette.primary.main,
              }}
            >
              {loading ? "Generating..." : "Generate Flashcards"}
            </Button>
          </Paper>
        </Box>
        {flashcards.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" color={theme.palette.text.primary}>
              Flashcard Preview
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {flashcards.map((flashcard, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      boxShadow: "4 4px 12px rgba(0,0,0,0.1)",
                      borderRadius: 3,
                      backgroundColor: theme.palette.background.default,
                    }}
                  >
                    <CardActionArea onClick={() => handleCardClick(index)}>
                      <CardContent>
                        <Box
                          sx={{
                            perspective: "1000px",
                            "& > div": {
                              transition: "transform 0.6s",
                              transformStyle: "preserve-3d",
                              position: "relative",
                              width: "100%",
                              height: "200px",
                              transform: flipped[index]
                                ? "rotateY(180deg)"
                                : "rotateY(0deg)",
                            },
                            "& > div > div": {
                              position: "absolute",
                              width: "100%",
                              height: "200px",
                              backfaceVisibility: "hidden",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              padding: 2,
                              boxSizing: "border-box",
                              backgroundColor: theme.palette.background.paper,
                            },
                            "& > div > div:nth-of-type(2)": {
                              transform: "rotateY(180deg)",
                              backgroundColor: theme.palette.action.hover,
                            },
                          }}
                        >
                          <div>
                            <div>
                              <Typography variant="h6" component="div">
                                {flashcard.front}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="h6" component="div">
                                {flashcard.back}
                              </Typography>
                            </div>
                          </div>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box
              sx={{
                mt: 4,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                color="secondary"
                onClick={handleOpenDialog}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  backgroundColor: theme.palette.secondary.main,
                }}
              >
                Save Flashcards
              </Button>
            </Box>
          </Box>
        )}
        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Save Flashcard Set</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter a name for your flashcard set.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Set Name"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={saveFlashcards}
              sx={{
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}