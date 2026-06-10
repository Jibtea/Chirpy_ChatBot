import fs from "fs";

const places = JSON.parse(
    fs.readFileSync(
        "./resources/placesAddType.json",
        "utf8"
    )
);

const searchData = [];

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

export {
    places,
    searchData
};