import {
    getProducts,
    getActivities,
    getPlaces
} from "./dataService.mjs";


export async function getSearchData() {

    const products = await getProducts();

    const activities = await getActivities();

    const places = await getPlaces();


    const productSearchData = [];

    const activitySearchData = [];

    const placeSearchData = [];


    // Product
    products.forEach(product => {

        productSearchData.push({

            type: "product",

            name: product.name,

            detail: `
                ${product.note ?? ""}
                ${product.highlight ?? ""}
            `,

            raw: product

        });

    });


    // Activity
    activities.forEach(activity => {

        activitySearchData.push({

            type: "activity",

            name: activity.name,

            detail: `
                ${activity.description ?? ""}
                ${activity.note ?? ""}
                ${activity.location ?? ""}
            `,

            raw: activity

        });

    });


    // Place
    places.forEach(place => {

        placeSearchData.push({

            type: "place",

            name: place.name,

            detail: `
                ${place.origin ?? ""}
            `,

            raw: place

        });

    });


    return {

        productSearchData,

        activitySearchData,

        placeSearchData

    };
}