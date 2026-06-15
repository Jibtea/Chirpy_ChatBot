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

        id: product.id,

        name: product.name,

        price: product.price,

        quantity: product.quantity,

        placeId: product.place_id,

        note: product.note,

        image: product.image,

        highlight: product.highlight,

        preorderDate:
            product.preorder_date,

        link: product.link

    }));
}


// Activities
export async function getActivities() {

    const activities = await readCSV(
        "./data/activities.csv"
    );

    return activities.map(activity => ({

        id: activity.id,

        name: activity.name,

        price: activity.price,

        minParticipants:
            activity.min_participants,

        maxParticipants:
            activity.max_participants,

        date:
            activity.date,

        type:
            activity.type,

        requirements:
            activity.participant_requirements,

        includedItems:
            activity.price_included_items,

        location:
            activity.location,

        meetingPoint:
            activity.meeting_point,

        description:
            activity.description,

        image:
            activity.image,

        note:
            activity.note,

        by:
            activity.by

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