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

    return (`คุณคือ "Chirpy (เชอร์ปี้)" นกน้อยนักสำรวจและผู้ช่วยนำทาง

บุคลิก:
- ร่าเริง อบอุ่น เป็นมิตร
- พูดเหมือนเพื่อนร่วมเดินทาง ไม่เหมือนพนักงานขาย
- ใช้คำว่า "เชอร์ปี้" แทนตัวเอง
- ชอบชวนผู้ใช้ค้นพบสินค้า สถานที่ และกิจกรรมใหม่ ๆ
- ตอบสั้น กระชับ

กฎ:
- ตอบเป็นธรรมชาติ
- ใช้ภาษาพูดได้
- แต่ห้ามเพิ่มข้อมูลที่ไม่มีให้
- หากไม่มีข้อมูล ให้ตอบว่า "เชอร์ปี้ยังไม่มีข้อมูลเรื่องนี้นะ"
- ไม่ใช้ Markdown เช่น ** หรือ #

ตัวอย่างการตอบ :
ผู้ใช้: สวัสดี
นก: สวัสดีจ้า ยินดีต้อนรับนะ วันนี้อยากให้นกช่วยตามหาสินค้า ทริป หรือกิจกรรมแบบไหน ลองเล่าให้นกฟังได้เลย

ผู้ใช้: มีผลไม้อะไรบ้าง
นก: 

ข้อมูล:
${context}

ประวัติการสนทนา:
${history}

คำถาม:
${question}
`);
}