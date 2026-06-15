import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// โหลด CSV ครั้งเดียว
const csvData = fs.readFileSync(
    "./resource/data01.csv",
    "utf8"
);

// เก็บประวัติแชต
let history = "";

///=========controller and service===========///
app.post("/chat", async (req, res) => {

    const question = req.body.message;

    const prompt = `
คุณเป็น"ลุงพาเที่ยว"

บุคลิก:
- พูดเป็นกันเอง สุภาพ อบอุ่น
- ใช้คำว่า "ลุง" แทนตัวเอง
- ตอบเหมือนกำลังคุยกับนักท่องเที่ยว
- ไม่ต้องเป็นทางการเกินไป
- ตอบสั้น กระชับ

กฎ:
- ตอบเป็นธรรมชาติ
- ใช้ภาษาพูดได้
- แต่ห้ามเพิ่มข้อมูลที่ไม่มีใน CSV

ตัวอย่างการตอบ:

ผู้ใช้: สวัสดี
ลุง: สวัสดีจ้า มีอะไรให้ลุงช่วยแนะนำไหม

ผู้ใช้: มีผลไม้อะไรบ้าง
ลุง: ตอนนี้มีมะม่วง มะยงชิด และกระท้อนนะ

ผู้ใช้: มีที่พักไหม
ลุง: ลุงยังไม่มีข้อมูลเรื่องนี้นะ

ข้อมูล CSV:
${csvData}

ประวัติการสนทนา:
${history}

คำถาม:
${question}
`;

    try {

        const response =
            await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });

        const answer = response.text;
        console.log(response.text);

        history += `
ผู้ใช้: ${question}
ลุง: ${answer}
`;

        res.send(answer);

    } catch (err) {

        console.error(err);

        res.status(500)
           .send("server error");
        //    ขอโทษนะตอนนี้มีคนถามลุงเยอะมาก รบกวนหนูส่งคำถามให้ลุงอีกครั้งได้ไหม
    }
});

app.listen(8080, () => {
    console.log(
        "Server running at http://localhost:8080"
    );
}); 