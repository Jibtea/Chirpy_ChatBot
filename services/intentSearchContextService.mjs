import Fuse from "fuse.js";

//====================Intent type of question==============================//
export function getIntent(question) {

    if (
        /ของฝาก|สินค้า|กิน|ดื่ม|อาหาร/
            .test(question)
    ) {
        return "product";
    }

    if (
        /กิจกรรม|เวิร์กช็อป|workshop|ทำอะไร/
            .test(question)
    ) {
        return "activity";
    }


    if (
        /เที่ยว|สถานที่|ชุมชน|ไปไหนดี|ธรรมชาติ/
            .test(question)
    ) {
        return "place";
    }

    if (
        /แนะนำ|มีอะไรบ้าง|น่าสนใจ/
            .test(question)
    ) {
        return "recommend";
    }

    if (/ซื้อ|ลิงก์|ลิ้งก์|link|สั่งซื้อ|สั่ง|กดตะกร้า|เอาสินค้านี้|ไปเลย|เอาอันนี้|จัด|เอา/.test(question))
        return "buy";

    return "chat";
}

export function getType(question) {

    if (/เหล้า|สุรา/.test(question))
        return "alcohol";

    if (/หิว|กิน/.test(question))
        return "eatable";

    if (/เที่ยว/.test(question))
        return "travel";

    return "etc";
}

//==============searchService=========//
export function createFuse(searchData) {

    return new Fuse(searchData, {

        keys: [

            {
                name: "name",
                weight: 0.8
            },

            {
                name: "detail",
                weight: 0.2
            }

        ],

        threshold: 0.7,

        includeScore: true,

        ignoreLocation: true
    });

}

//==============EDIT CONTEXT===============//
export function buildContext(result) {

    return result
        .slice(0, 3)
        .map(r => {

            const item = r.item;
            const data = item.raw;

            switch (item.type) {

                case "product":

                    return `
สินค้า: ${data.name ?? "-"}
ประเภท: ${data.type ?? "-"}
ข้อมูล: ${data.detail ?? "-"}
จุดเด่น: ${data.highlight ?? "-"}
เหมาะกับ: ${data.target ?? "-"}
ราคา: ${data.price ?? "-"}
ลิงก์: ${data.link ?? "-"}
`;

                case "activity":

                    return `
กิจกรรม: ${data.name ?? "-"}
ประเภทกิจกรรม: ${data.type ?? "-"}
รายละเอียด: ${data.description ?? "-"}
สถานที่: ${data.location ?? "-"}
จุดนัดพบ: ${data.meetingPoint ?? "-"}
ราคา: ${data.price ?? "-"}
`;

                case "place":

                    return `
สถานที่: ${data.name ?? "-"}
ที่มาสถานที่: ${data.origin ?? "-"}
ลิงก์: ${data.link ?? "-"}
`;

                default:
                    return "";
            }

        })
        .join("\n\n");
}