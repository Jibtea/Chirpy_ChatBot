import Fuse from "fuse.js";

//====================Intent type of question==============================//
export function getIntent(question) {

    if (/ราคา|เท่าไร|กี่บาท/.test(question))
        return "price";

    if (/ซื้อ|ลิงก์|ลิ้งก์|link|สั่งซื้อ|สั่ง|กดตะกร้า|เอาสินค้านี้/.test(question))
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
export function createFuse(
    searchData
) {

    return new Fuse(
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
                { name: "productTarget", weight: 0.3 }
            ],
            threshold: 0.6,
            includeScore: true,
            ignoreLocation: true
        }
    );
}

//==============EDIT CONTEXT===============//
export function buildContext(
    result
) {

    return result
        .slice(0, 3)
        .map(r => {

            const place =
                r.item.raw.place;

            const product =
                r.item.raw.product;

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
}