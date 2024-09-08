"use client";

import {Container,Box,Typography, Paper, TextField, Button, CardActionArea, Card, CardContent, Grid, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress, useTheme, AppBar, Toolbar, IconButton,} from "@mui/material";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { doc, collection, getDoc, writeBatch, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from 'next/navigation'

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter()

  const theme = useTheme();

  const handleSubmit = async () => {
    fetch("api/generate", {
        method: "POST",
        body: text,
      })
        .then((res)=> res.json())
        .then((data) => setFlashcards(data))
    } 

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveFlashcards = async () => {
    if (!name) {
      alert("Please enter a name");
      return;
    }

    const batch = writeBatch(db);
    const userDocRef = doc(db, "users", user.id);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const collections = docSnap.data().flashcards || []
      if (collections.find((f)=> f.name === name)){
        alert("Flashcard collection with the same name already exists.")
        return
      } else {
        collections.push({name})
        batch.set(userDocRef, { flashcards: collections}, {merge: true});
      }
    }
    else {
      batch.set(userDocRef, { flashcards: [{name}]});
    }

    const colRef = collection(userDocRef, name)
    flashcards.forEach((flashcard)=> {
      const cardDocRef = doc(colRef)
      batch.set(cardDocRef, flashcard)
    })

    await batch.commit();
    alert("Flashcards saved");
    handleClose();
    router.push('/flashcards')
  };

  return (
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
            }}
          >
            <TextField
              value={text}
              onChange={(e) => setText(e.target.value)}
              label="Enter text"
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
            >
              Submit
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
                              <Typography variant="h5" component="div">
                                {flashcard.front}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="h5" component="div">
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
                onClick={handleOpen}
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
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Save Flashcard Set</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter a name for your flashcard collection.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Collection Name"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={saveFlashcards}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
  );
}