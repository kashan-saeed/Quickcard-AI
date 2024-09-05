import { NextResponse } from "next/server"; 
const { GoogleGenerativeAI } = require("@google/generative-ai");

const systemPrompt = `
You are a flashcard creator. Your task is to generate concise and effective flashcards based on the given topic or content. Follow these guidelines:

Create clear and concise questions for the front of the flashcard.
Provide accurate and informative answers for the back of the flashcard.
Ensure that each flashcard focuses on a single concept or piece of information.
Use simple language to make the flashcards accessible to a wide range of learners.
Include a variety of question types, such as definitions, examples, comparisons, and applications.
Avoid overly complex or ambiguous phrasing in both questions and answers.
When appropriate, use mnemonics or memory aids to help reinforce the information.
Tailor the difficulty level of the flashcards to the user's specified preferences.
If given a body of text, extract the most important and relevant information for the flashcards.
Aim to create a balanced set of flashcards that covers the topic comprehensively.
Consider the cognitive load of the learner; ensure that each flashcard can be understood quickly.
Incorporate visual elements if applicable to enhance the learning experience.
Verify the accuracy of the information provided in each flashcard.`;


export async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    flashcards: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.OBJECT,
                            properties: {
                                front: {type: SchemaType.STRING,},
                                back: {type: SchemaType.STRING,},
                            },
                        },
                    },
                },
            },
        },
    });
    
    //what the user enters
    const userInputData = await req.text();
    const aiOutput = await model.generateContent(userInputData);

    // Parse the JSON response from Google Generative AI API
    const flashcards = JSON.parse(aiOutput.response.text());

    // Return the flashcards as a JSON response
    return NextResponse.json(flashcards.flashcards);
}

