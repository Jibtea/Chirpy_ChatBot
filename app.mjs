import express from "express";
import dotenv from "dotenv";

// import { createFuse } from "./services/searchService.mjs";
import { askGemini, buildPrompt } from "./services/geminiService.mjs";
import { getSession, sessionSet, updateHistory } from "./services/sessionService.mjs";
import { getIntent, buildContext, createFuse } from "./services/intentSearchContextService.mjs";

import { normalizeQuestion, adjustScore } from "./utils/normalizeQuestion.mjs";
import { getSearchData } from "./services/searchDataService.mjs";

import { createFAQFuse, searchFAQ } from "./services/faqService.mjs";

dotenv.config();

const app = express();

const faqFuse = await createFAQFuse();

app.use(express.json());
app.use(express.static("public"));


// const searchData = await getSearchData();
// const fuse = createFuse(searchData);
//==========find by intent=========//
const {
    productSearchData,
    activitySearchData,
    placeSearchData } = await getSearchData();
const productFuse = createFuse(productSearchData);

const activityFuse = createFuse(activitySearchData);

const placeFuse = createFuse(placeSearchData);

const allFuse = createFuse([
        ...productSearchData,
        ...activitySearchData,
        ...placeSearchData
    ]);
//=========================================//


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

        //=========FAQ=========//
        const faqAnswer =
            searchFAQ(
                faqFuse,
                question
            );

        if (faqAnswer) {

            updateHistory(
                sessionId,
                question,
                faqAnswer
            );

            return res.json({
                answer: faqAnswer
            });

        }

        //========Intent================//

        const intent = getIntent(question);


        let fuse;

        switch (intent) {

            case "product":

                fuse = productFuse;
                break;


            case "activity":

                fuse = activityFuse;
                break;


            case "place":

                fuse = placeFuse;
                break;


            default:

                fuse = allFuse;
        }

        if (
            intent === "price" &&
            session.lastResults
        ) {

            const answer =
                session.lastResults.raw.name + "ราคา " +
                session.lastResults.raw.price +
                "บาทจ้า" + "ลิ้งก์นี้เลยนะ" + session.lastResults.raw.link;

            updateHistory(
                sessionId,
                question,
                answer
            );

            console.log("price");

            return res.json({
                answer
            });
        }

        if (
            intent === "buy" &&
            session.lastResults
        ) {

            const answer =
                `ซื้อได้ที่ ${session.lastResults.raw.name} นะ\n` +
                `ลิงก์นี้เลยจิ๊บ : ${session.lastResults.raw.link} เดี๋ยวเชอรปี้พาไปนะจิ๊บๆ`;

            updateHistory(
                sessionId,
                question,
                answer
            );
            console.log("buy");

            return res.json({
                answer,
                link:
                    session.lastResults.raw
                        .link
            });
        }

        //============Search====================///

        let result =
            fuse.search(question);

        if (result.length === 0) {
            result = fuse.search(cleanQuestion);
        } if (result.length === 0) {
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
        console.log("result", result);

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
เชอร์บี้: ${chat.answer}`
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
                "ขอโทษนะตอนนี้เชอร์บี้ยุ่งอยู่ ลองใหม่อีกทีได้ไหมจิ๊บๆ",
            error: true
        });
    }
});

app.listen(8080, () => {

    console.log(
        "Server running at http://localhost:8080"
    );
});