import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import Fuse from "fuse.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const places = JSON.parse(
    fs.readFileSync(
        "./resource/placesAddType.json",
        "utf8"
    )
);

let context = null;
let currentProduct = null;
const searchData = [];

///////////////////////////////////////////////////////////////
const sessions = {};
const sessionId = 0;


sessions[sessionId] = {
    lastResults: null,
    history: [],
};

function sessionSet(
    sessionId,
    context
) {
    sessions[sessionId].lastResults =
        context;
}

function updateHistory(sessionId, question, answer) {

    sessions[sessionId].history.push({
        question,
        answer
    });

    // เก็บแค่ 5 คู่ล่าสุด
    if (sessions[sessionId].history.length > 5) {
        sessions[sessionId].history.shift();
    }
}



function getIntent(question) {

    if (/ราคา|เท่าไร|กี่บาท/.test(question))
        return "price";

    if (/ซื้อ|ลิงก์|ลิ้งก์|link|สั่งซื้อ/.test(question))
        return "buy";

    return "chat";
}

function getType(question) {

    if(/เหล้า|สุรา/.test(question))
        return "alcohol";
    else if (/หิว|กิน/.test(question))
        return "eatable";
    else if (/เที่ยว/.test(question))
        return "travel";

    return "etc";
}


////////////////////////////////////////////////////////////


//========================================//
places.forEach(place => {
    place.products.forEach(product => {
        searchData.push({
            placeName:
                place.place.name,
            placeOrigin:
                place.place.origin,
            productName:
                product.name,
            productType:
                product.type,
            productOrigin:
                product.origin,
            productDetail:
                product.detail,
            productHighlight:
                product.highlight,
            productTarget:
                product.target,
            raw: {
                place: place.place,
                product: product
            }
        });
    });
});








///=========controller and service===========///
app.post("/chat", async (req, res) => {

    let question = req.body.message;
    question = question.replace(
        /เหล้า/g,
        "สุรา"
    );
    let cleanQuestion = question
        .replace(/อยาก|กิน|ซื้อ|หา|จังเลย|หน่อย|ครับ|ค่ะ/g, "")
        .trim();

    const fuse = new Fuse(
        searchData,
        {
            keys: [
                { name: "placeName", weight: 0.8 },
                { name: "placeOrigin", weight: 0.1 },

                { name: "productName", weight: 0.8 },
                { name: "productType", weight: 0.7 },
                { name: "productOrigin", weight: 0.1 },
                { name: "productDetail", weight: 0.2 },
                { name: "productHighlight", weight: 0.2 },
                { name: "productTarget", weight: 0.3 },
            ],
            threshold: 0.6,
            includeScore: true,
            ignoreLocation: true
        }
    );

    let result = fuse.search(question);

    if(result.length === 0){
        result = fuse.search(cleanQuestion);
        if(result.length === 0){
            result = searchData.map(item => ({
                item,
                score: 1
            }));
        }
    }else{
        const intent = getIntent(question);
        if (intent === "price") {
            let answer = "ราคา" + sessions[0].lastResults.raw.price + "จ้า";
            updateHistory(question, answer);
            return res.json({
                answer: answer
            });
        }
        else if (intent === "buy") {
            let answer = "ซื้อได้ที่ " + sessions[0].lastResults.placeName + " นะจ๊ะ \n ลิงก์นี้เลยจ้า : " + sessions[0].lastResults.raw.product.link + " เดี๋ยวลุงพาไปนะ";
            updateHistory(sessionId,question, answer);
            return res.json({
                answer: answer,
                link: sessions[0].lastResults.raw.product.link
            });
        }
    }
  

    result = result.map(r => {

        let bonus = 0;

        const intentType =getType(question);
        const type = r.item.productType || "";

        if (intentType === "eatable") {

            if (
                type.includes("อาหาร") ||
                type.includes("เครื่องดื่ม") ||
                type.includes("ขนม")
            ) {
                bonus += 0.8;
            }
        }
        if (intentType === "travel") {

            if (
                type.includes("ท่องเที่ยว")
            ) {
                bonus += 0.8;
            }
        }
        if (intentType === "alcohol") {

            if (
                type.includes("ของมึนเมา") ||
                type.includes("สุรา")
            ) {
                bonus += 0.8;
            }
        }

        console.log(r.item.productName,"Intent : ",intentType);

        return {
            ...r,
            adjustedScore: r.score - bonus
        };
    });



    result.sort(
    (a, b) => a.adjustedScore - b.adjustedScore
    );

    sessionSet(sessionId,result[0].item);
    // console.log(sessions[sessionId]);
    console.log("--------------------------",
            result.slice(0, 3).map(r => ({
                product: r.item.productName,
                score: r.score,
                adjustedScore: r.adjustedScore
            }))
        );


    const context = result
        .slice(0, 3)
        .map(r => {
            const place = r.item?.raw?.place || {};
            const product = r.item?.raw?.product || {};

            return `
        สถานที่: ${place.name ?? "-"}
        ที่มาสถานที่: ${place.origin ?? "-"}
        สินค้า: ${product.name ?? "-"}
        ประเภท: ${product.type ?? "-"}
        ข้อมูล: ${product.detail ?? "-"}
        จุดเด่น: ${product.highlight ?? "-"}
        เหมาะกับ: ${product.target ?? "-"}
        ราคา: ${product.price ?? "-"}
        ลิงก์: ${product.link ?? "-"}
        `;
        })
        .join("\n\n");

    // if (!result.length) {
    //     return res.json({
    //         answer: "ลุงยังไม่มีข้อมูลที่เกี่ยวข้องเลย แต่เดี๋ยวลุงไปเพิ่มให้ในอนาคตนะ"
    //     });
    // }
    // console.log("result", result);
    // console.log("context", context);

    const historyText =
    sessions[sessionId].history
        .map(chat =>
            `ผู้ใช้: ${chat.question}
ลุง: ${chat.answer}
`
        )
        .join("\n\n");



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
${historyText}

คำถาม:
${question}
`;


    try {

        const response =
            await ai.models.generateContent({
                model: "gemini-2.5-flash",
                // model: "gemini-2.0-flash-lite",
                contents: prompt
            });

        const answer = response.text;

        updateHistory(sessionId,question,answer);

        res.json({
            answer: answer,
            context: context
        });

    } catch (err) {

        console.error(err);
        console.log("context", context);

        res.status(500).json({
            answer: "server error",
            context: context,
            error: true
        });
        //    ขอโทษนะตอนนี้มีคนถามลุงเยอะมาก รบกวนหนูส่งคำถามให้ลุงอีกครั้งได้ไหม
    }
});

app.listen(8080, () => {
    console.log(
        "Server running at http://localhost:8080"
    );
}); 