import Fuse from "fuse.js";
import fs from "fs";
import csv from "csv-parser";


// ================= Read CSV =================

function readCSV(path) {

    return new Promise((resolve, reject) => {

        const results = [];

        fs.createReadStream(path)
            .pipe(csv())
            .on("data", (data) => {

                results.push(data);

            })
            .on("end", () => {

                resolve(results);

            })
            .on("error", (err) => {

                reject(err);

            });

    });

}


// ================= Create FAQ Fuse =================

export async function createFAQFuse() {

    const faqData = await readCSV(
        "./data/faq.csv"
    );

    //  console.log(faqData);

    const formattedFAQ = faqData.map(faq => ({
        ...faq,
        question: faq.question.split("|")
    }));


    return new Fuse(
        formattedFAQ,
        {
            keys: [
                {
                    name: "question",
                    weight: 1
                }
            ],
            threshold: 0.2,
            ignoreLocation: true,
            includeScore: true
        }
    );
}


// ----------------- ตัดคำน้า -------------------
function normalizeFAQQuestion(question) {
    return question
        .replace(/จ้า|จ๊ะ|จ๋า|ครับ|ค่ะ|คับ/g, "")
        .trim();
}

// ================= Search FAQ =================

export function searchFAQ(
    fuse,
    question
) {
    question = normalizeFAQQuestion(question);

    const result =
        fuse.search(question);


    if (
        result.length === 0
    ) {

        return null;

    }


    return result[0].item.answer;

}