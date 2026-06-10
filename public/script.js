const input =
    document.getElementById("message");

input.addEventListener(
    "keydown",
    (e) => {

        if (e.key === "Enter") {
            sendMessage();
        }
    }
);

async function sendMessage() {

    const msg = input.value.trim();

    if (!msg) return;

    const chat =
        document.getElementById("chat");

    chat.innerHTML += `
        <div class="message user">
            ${msg}
        </div>
    `;

    input.value = "";

    const loadingId =
        "loading-" + Date.now();

    chat.innerHTML += `
        <div
            id="${loadingId}"
            class="loading"
        >
            🧓 ลุงกำลังหาข้อมูล...
        </div>
    `;

    chat.scrollTop =
        chat.scrollHeight;

    try {

        const response =
            await fetch("/chat", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: msg
                })
            });

        // let answer = await response.text();
        // console.log(answer);
        const data =
            await response.json();
        
            if (data.link) {
                window.open(data.link, "_blank");
            }

        let answer =
            data.answer;

        const context =
            data.context;
        
        console.log("DATA", data);
        console.log(answer)
        // console.log("CONTEXT", context);

        if (answer === "server error") {
            answer =
                "ขอโทษนะ ตอนนี้มีคนถามลุงเยอะมาก รบกวนหนูส่งคำถามให้ลุงอีกครั้งได้ไหมจ้ะ 😊";
        }

        ///=====text convert====////
        answer = answer
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/#/g, "");


        document
            .getElementById(loadingId)
            .remove();

        chat.innerHTML += `
            <div class="message bot">
                🧓 ${answer}
            </div>
        `;

    } catch (error) {
        console.log(error)

        document
            .getElementById(loadingId)
            .remove();

        chat.innerHTML += `
            <div class="message bot">
                ขอโทษนะตอนนี้มีคนถามลุงเยอะมาก รบกวนหนูส่งคำถามให้ลุงอีกครั้งได้ไหม
            </div>
        `;
    }

    chat.scrollTop =
        chat.scrollHeight;
}