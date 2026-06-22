import fs from "fs";
import csv from "csv-parser";


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


// Products
export async function getProducts() {

    const products = await readCSV(
        "./data/products.csv"
    );

    return products.map(product => ({

        id: product.product_id,

        name: product.product_name,

        price: product.product_price,

        quantity: product.product_quantity,

        // placeId: product.product_place_id,
        origin: product.product_origin,

        note: product.product_note,

        image: product.product_image,

        highlight: product.product_highlight,

        preorderDate:
            product.product_preorderDate,

        link: product.product_link

    }));
}


// Activities
export async function getActivities() {

    const activities = await readCSV(
        "./data/activities.csv"
    );

    return activities.map(activity => ({

        id: activity.activity_id,

        name: activity.activity_name,

        price: activity.activity_price,

        minParticipants:
            activity.activity_min_participants,

        maxParticipants:
            activity.activity_max_participants,

        date:
            activity.activity_date,

        type:
            activity.activity_type,

        requirements:
            activity.activity_participant_requirements,

        includedItems:
            activity.activity_price_included_items,

        location:
            activity.activity_location,

        meetingPoint:
            activity.activity_meeting_point,

        description:
            activity.activity_description,

        image:
            activity.activity_image,

        note:
            activity.activity_note,

        by:
            activity.activity_by

    }));

}


// Places
export async function getPlaces() {

    const places = await readCSV(
        "./data/places.csv"
    );

    return places.map(place => ({

        id:
            place.id,

        name:
            place.name,

        origin:
            place.origin,

        link:
            place.link

    }));

}