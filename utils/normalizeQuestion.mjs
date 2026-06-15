import { getType }
    from "../services/intentSearchContextService.mjs";

export function normalizeQuestion(
    question
) {

    question = question.replace(
        /เหล้า/g,
        "สุรา"
    );

    const cleanQuestion =
        question
            .replace(
                /อยาก|กิน|ซื้อ|หา|จังเลย|หน่อย|ครับ|ค่ะ/g,
                ""
            )
            .trim();

    return {
        question,
        cleanQuestion
    };
}

export function adjustScore(
    result,
    question
) {

    const intentType =
        getType(question);

    result = result.map(r => {

        let bonus = 0;

        const type =
            r.item.productType || "";

        switch (intentType) {

            case "eatable":

                if (
                    /อาหาร|เครื่องดื่ม|ขนม/
                        .test(type)
                ) {
                    bonus += 0.8;
                }

                break;

            case "travel":

                if (
                    /ท่องเที่ยว/
                        .test(type)
                ) {
                    bonus += 0.8;
                }

                break;

            case "alcohol":

                if (
                    /สุรา|ของมึนเมา/
                        .test(type)
                ) {
                    bonus += 0.8;
                }

                break;
        }

        return {
            ...r,
            adjustedScore:
                r.score - bonus
        };
    });

    result = result.sort(
        (a, b) =>
            a.adjustedScore -
            b.adjustedScore
    ).slice(0, 3);

    return result;
}