const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");


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

//what the user enters
const userInputData = `Recap of Last Week:
- We end up spending our life aversing anxiety
- The best way to relieve yourself of all concerns is to collect your matters and go to Allah with 
    ○ Fear is their for a reason

Of the things that human beings waste is in being:
- Too Afraid or too hopeful of a human being. That Human is under the control of Allah. 
    ○ His heart is in between the fingers of Allah. And he has no say in his life or death.

There is fear, there is hope, but those are intended for Allah.
- Our fears are real
    ○ Job, kids, everything.
- But they are misplaced
    ○ Put that energy from fear into Allah

Hadith: Whomever makes his concern and fear One (Allah), Allah will suffice him every single fear and concern in this life.
- Everything is under the control of Allah

The way to being with Allah is 2 steps:
1. Out of yourself
2. With the creation
    a. Perish from being afraid of ppl with the statement that "Everything happens by the permission of Allah"
    b. The heart of the person in front of you is not even theirs, its in the hands of Allah
    c. Whenever anything happens see through it
        i. Someone says something bad about you. Ask Allah to forgive them, as they became used by Shaytan

Story: Al-Izz bin Abdul Salaam (A very big scholar) who stood in front of a parade and embarrassed a sultan who was surrounded by mamluks.
- I remembered who Allah is and the glory of Allah, the day of judgment, angels. And when I saw him he looked like a kitten
- Why did you admonish him in front of everyone? It should have been done in private
    ○ When the Sultan was walking in the parade I saw in the his heart pride and I was afraid of him becoming afflicted with something worse. And so I wanted to prevent that.
    
Don't try to eliminate fear. Put it where it belongs.

The two biggest things humans waste. At the core of all of the things we waste:
1. A person losing his heart
    a. Put this before everything else. Before everyone else. Before your kids, parents, ect
    b. If you lose this then you won't be able to be a good father, son anyway
2. A person wasting their time
    a. This is our capital

- These are the two things we are responsible for. We will be asked about this.
    ○ We are the king of these two, and don't worry about anything else. Allah is the king of them.

I am amazed by the person that whenever anything of the worldly life comes they turn to Allah so much.
- They ask for the dunya
- But they forget to ask for the spiritual matters of their heart
    ○ Ya Allah purify my Heart of everything but you
    ○ Grant me good manners (this is a part of the Heart)
    ○ Assume that all the ailments of the heart are in you. And ask Allah to purify your heart of it and give you the opposite.
        § Name them one by one
        § Pure my heart of Greed…
        § Pure my Heart of …

Heart:
- You want to keep your heart safe from disturbences
- Someone insults you
    ○ You let it go and don't agonize over it. Otherwise agonizing over it will effect your heart
- Someone steals from you
    ○ Same. Let it go. Don't agonize over it
- This is someone who knows the value of the Heart

- What ruins the heart. When it clings to the worldly life, to the hawaa.
- 2 forces within the heart:
    ○ Spiritual heart
    ○ Nafs
        § Shawah
        § Anger
        § Worst Force: Hawaa

Hawaa:
- Philosophies that come from within us that we follow
- Full of your own opinion and views
- The thing that the nafs will hold onto is its own opinions.
    ○ Ppl will die defending their own opinions
- It is easier to take your nails to a mountain then to change an opinion that is engrained in your ego
- "A fa man … an il hawaa"

- Sometimes we see something and we are fully convinced it is right. And later we discover that it wasn't right.

- The problem with Hawaa is that you don't think it is bad, and so your heart will follow it with full conviction.
- The instrument by which we gauge right and wrong is corrupted.
- Hadith: ppl at end of time where hawaa will do to them what rabies do to Dogs.

How do you get out of Hawaa:
- How do you not follow your intellectual biases
- Opposite of Hawaa: Sharah
    ○ I need Allah to tell me this is beautiful and this is ugly
    ○ If you disagree then that is your own hawaa, and you go against it

Following Hawaa degrades the heart and the human being.
`


async function run() {
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

    const aiOutput = await model.generateContent(userInputData);
    //console.log(aiOutput);
    //console.log('------------');
    //console.log(aiOutput.response);
    //console.log('------------');
    //console.log(aiOutput.response.text());
    //console.log('------------');

    // Parse the JSON response from Gemini-AI API
    //console.log(aiOutput.response.candidates[0].content.parts[0].text);
    const flashcards = JSON.parse(aiOutput.response.text());

    console.log(flashcards);
    // Return the flashcards as a JSON response
    return NextResponse.json(flashcards.flashcards);
}

run();