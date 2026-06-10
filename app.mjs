import express from "express";
import dotenv from "dotenv";

// import { createFuse } from "./services/searchService.mjs";
import { askGemini, buildPrompt } from "./services/geminiService.mjs";
import { getSession, sessionSet, updateHistory } from "./services/sessionService.mjs";
import { getIntent, buildContext, createFuse } from "./services/intentSearchContextService.mjs";

import {normalizeQuestion , adjustScore} from "./utils/normalizeQuestion.mjs";
import { places, searchData }from "./services/placeLoaderService.mjs";
// import { adjustScore} from "./utils/typeScoring.mjs";


dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

const fuse = createFuse(searchData);

app.post("/chat", async (req, res) => {

    const sessionId =
        req.body.sessionId || "guest";

    const session =
        getSession(sessionId);

    try {

        const {
            question,
            cleanQuestion
        } = normalizeQuestion(
            req.body.message
        );

        //========Intent================//

        const intent =
            getIntent(question);

        if (
            intent === "price" &&
            session.lastResults
        ) {

            const answer =
                session.lastResults.raw.productName+ "ราคา " +
                session.lastResults.raw.product.price +
                " จ้า";

            updateHistory(
                sessionId,
                question,
                answer
            );

            return res.json({
                answer
            });
        }

        if (
            intent === "buy" &&
            session.lastResults
        ) {

            const answer =
                `ซื้อได้ที่ ${session.lastResults.placeName} นะจ๊ะ\n` +
                `ลิงก์นี้เลยจ้า : ${session.lastResults.raw.product.link} เดี๋ยวลุงพาไปนะ`;

            updateHistory(
                sessionId,
                question,
                answer
            );

            return res.json({
                answer,
                link:
                    session.lastResults
                        .raw.product.link
            });
        }

        //============Search====================///

        let result =
            fuse.search(question);

        if ( result.length === 0 ) {
            result = fuse.search(cleanQuestion);
        }if ( result.length === 0 ) {
            result =
                searchData.map(
                    item => ({
                        item,
                        score: 1
                    })
                );
        }

        //==============Ranking==============//

        result =
            adjustScore(
                result,
                question
            );
        console.log("result",result);

        //==============Session Set==========//

        sessionSet(sessionId, result[0].item);

        //================ Context ==============//

        const context =
            buildContext(result);

        //============== History =============//

        const historyText =
            session.history
                .map(
                    chat =>
                        `ผู้ใช้: ${chat.question}
ลุง: ${chat.answer}`
                )
                .join("\n\n");

        //=============== Prompt =============//

        const prompt =
            buildPrompt(
                context,
                historyText,
                question
            );

        // console.log("prompt",prompt);

        //=============== Gemini ============//

        const answer =
            await askGemini(
                prompt
            );

        updateHistory(
            sessionId,
            question,
            answer
        );

        return res.json({
            answer,
            context
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            answer:
                "ขอโทษนะตอนนี้ลุงยุ่งอยู่ ลองใหม่อีกทีได้ไหมจ๊ะ",
            error: true
        });
    }
});

app.listen(8080, () => {

    console.log(
        "Server running at http://localhost:8080"
    );
});