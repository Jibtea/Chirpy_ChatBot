import express from "express";
import dotenv from "dotenv";

import {chatController} from "./controllers/chatController.mjs";


dotenv.config();

const app = express();


app.use(express.json());
app.use(express.static("public"));


app.post( "/chat",chatController );


app.listen(8080, () => {

    console.log(
        "Server running at http://localhost:8080"
    );

});