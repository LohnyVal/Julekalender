require("dotenv").config();
const mongoose = require("mongoose");
 
const MONGO_URI = process.env.MONGODB;
 
const questions = [
  {
    id: 1,
    type: "multiple_choice",
    question: "Hvilken dato feirer vi julaften i Norge?",
    options: ["23. desember", "24. desember", "25. desember", "26. desember"],
    correct_answer: "24. desember"
  },
  {
    id: 2,
    type: "open",
    question: "Hva heter reinsdyret med den røde nesen?",
    correct_answer: "Rudolf"
  },
  {
    id: 3,
    type: "multiple_choice",
    question: "Hvilket land forbindes ofte med juletretradisjonen?",
    options: ["Norge", "Tyskland", "Italia", "Frankrike"],
    correct_answer: "Tyskland"
  },
  {
    id: 4,
    type: "video",
    question: "Se videoen og svar: Hvilken juleklassiker er dette?",
    video_url: "https://www.youtube.com/watch?v=E8gmARGvPlI",
    correct_answer: "Last Christmas – Wham!"
  },
  {
    id: 5,
    type: "open",
    question: "Hva heter hovedpersonen i filmen Hjemme alene?",
    correct_answer: "Kevin McCallister"
  },
  {
    id: 6,
    type: "multiple_choice",
    question: "Hva gjemmer man tradisjonelt i julegrøten?",
    options: ["En mandel", "En mynt", "En nøtt", "En karamell"],
    correct_answer: "En mandel"
  },
  {
    id: 7,
    type: "video",
    question: "Se videoen og svar: Hvem synger denne julesangen?",
    video_url: "https://www.youtube.com/watch?v=aAkMkVFwAoo",
    correct_answer: "Mariah Carey"
  },
  {
    id: 8,
    type: "open",
    question: "Hva heter TV-tradisjonen med grevinnen og hovmesteren?",
    correct_answer: "Grevinnen og hovmesteren (Dinner for One)"
  },
  {
    id: 9,
    type: "multiple_choice",
    question: "Hvilken dato er første juledag?",
    options: ["24. desember", "25. desember", "26. desember", "31. desember"],
    correct_answer: "25. desember"
  },
  {
    id: 10,
    type: "open",
    question: "Hva heter balletten som handler om en nøtteknekker?",
    correct_answer: "Nøtteknekkeren"
  },
  {
    id: 11,
    type: "multiple_choice",
    question: "Hva heter julenissen på engelsk?",
    options: ["Santa Claus", "Snowman", "Christmas Man", "Father Winter"],
    correct_answer: "Santa Claus"
  },
  {
    id: 12,
    type: "open",
    question: "Hvilken dato feires Lucia-dagen?",
    correct_answer: "13. desember"
  },
  {
    id: 13,
    type: "multiple_choice",
    question: "Hva heter planten man tradisjonelt kysser under?",
    options: ["Misteltein", "Julestjerne", "Holly", "Eføy"],
    correct_answer: "Misteltein"
  },
  {
    id: 14,
    type: "video",
    question: "Se videoen og svar: Hvilken sang hører du?",
    video_url: "https://www.youtube.com/watch?v=3CWJNqyub3o",
    correct_answer: "Jingle Bell Rock"
  },
  {
    id: 15,
    type: "open",
    question: "Hva heter snømannen i filmen Frost?",
    correct_answer: "Olaf"
  },
  {
    id: 16,
    type: "multiple_choice",
    question: "Hvilken farge forbindes mest med jul sammen med grønt?",
    options: ["Blå", "Rød", "Lilla", "Rosa"],
    correct_answer: "Rød"
  },
  {
    id: 17,
    type: "open",
    question: "Hva heter gutten som får en magisk togreise i julefilmen Polarekspressen?",
    correct_answer: "Han har ikke noe offisielt navn i filmen (ofte kalt Hero Boy)"
  },
  {
    id: 18,
    type: "multiple_choice",
    question: "Hvilket dyr trekker julenissens slede?",
    options: ["Hester", "Hunder", "Reinsdyr", "Elger"],
    correct_answer: "Reinsdyr"
  },
  {
    id: 19,
    type: "video",
    question: "Se videoen og svar: Hvilken julefilm kommer dette klippet fra?",
    video_url: "https://www.youtube.com/watch?v=e7dfCs0z5Eg",
    correct_answer: "Hjemme alene"
  },
  {
    id: 20,
    type: "open",
    question: "Hva heter den tradisjonelle norske julekaken som ofte kalles fattigmann?",
    correct_answer: "Fattigmann"
  },
  {
    id: 21,
    type: "multiple_choice",
    question: "Hvilken av disse er en vanlig norsk julemiddag?",
    options: ["Taco", "Ribbe", "Sushi", "Pizza"],
    correct_answer: "Ribbe"
  },
  {
    id: 22,
    type: "open",
    question: "Hva heter den røde blomsten som er svært populær til jul?",
    correct_answer: "Julestjerne"
  },
  {
    id: 23,
    type: "multiple_choice",
    question: "Hvor mange luker har en tradisjonell julekalender?",
    options: ["12", "20", "24", "31"],
    correct_answer: "24"
  },
  {
    id: 24,
    type: "open",
    question: "Hva heter den kjente julesangen som starter med ordene «Glade jul, hellige jul»?",
    correct_answer: "Glade jul"
  }
];
 
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
 
    const collection = mongoose.connection.db.collection("quizzes");
 
    await collection.updateOne(
      { _id: "christmas-quiz" },
      {
        $set: {
          questions,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
 
    console.log(`Successfully seeded ${questions.length} questions!`);
 
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
 
seed();