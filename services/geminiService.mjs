import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export async function askGemini(prompt) {

    const response =
        await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

    return response.text;
}

export function buildPrompt(
    context,
    history,
    question
) {

    return (`คุณเป็นลุงพาเที่ยว

บุคลิก:
- พูดเป็นกันเอง สุภาพ อบอุ่น
- ใช้คำว่า "ลุง" แทนตัวเอง
- ตอบเหมือนกำลังคุยกับนักท่องเที่ยว
- ไม่ต้องเป็นทางการเกินไป
- ตอบสั้น กระชับ

กฎ:
- ตอบเป็นธรรมชาติ
- ใช้ภาษาพูดได้
- แต่ห้ามเพิ่มข้อมูลที่ไม่มีให้

ตัวอย่างการตอบ:

ผู้ใช้: สวัสดี
ลุง: สวัสดีจ้า มีอะไรให้ลุงช่วยแนะนำไหม

ผู้ใช้: มีผลไม้อะไรบ้าง
ลุง: ตอนนี้มีมะม่วง มะยงชิด และกระท้อนนะ

ผู้ใช้: มีที่พักไหม
ลุง: ลุงยังไม่มีข้อมูลเรื่องนี้นะ

ข้อมูล:
${context}

ประวัติการสนทนา:
${history}

คำถาม:
${question}
`);
}