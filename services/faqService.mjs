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


    return new Fuse(
        faqData,
        {
            keys: [
                {
                    name: "question",
                    weight: 1
                }
            ],
            threshold: 0.3,
            ignoreLocation: true,
            includeScore: true
        }
    );
}


// ================= Search FAQ =================

export function searchFAQ(
    fuse,
    question
) {

    const result =
        fuse.search(question);


    if (
        result.length === 0
    ) {

        return null;

    }


    return result[0].item.answer;

}