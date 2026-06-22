async function loadChatWidget() {

    const html =
        await fetch(
            "/chat-widget/chatWidget.html"
        ).then(r => r.text());

    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );

    initChatWidget();
}

async function showLoading(messages) {

    const loading = document.createElement("div");
    loading.className = "loading";

    loading.innerHTML = `
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    `;

    messages.appendChild(loading);
    messages.scrollTop = messages.scrollHeight;

    return loading;
}

function initChatWidget() {

    const chatBtn =
        document.getElementById(
            "chat-btn"
        );

    const chatBox =
        document.getElementById(
            "chat-box"
        );

    const closeBtn =
        document.getElementById(
            "close-chat"
        );

    const sendBtn =
        document.getElementById(
            "send-btn"
        );

    const input =
        document.getElementById(
            "message"
        );

    const messages =
        document.getElementById(
            "messages"
        );

    chatBtn.onclick = () => {

        chatBox.classList.toggle(
            "hidden"
        );
    };

    closeBtn.onclick = () => {

        chatBox.classList.add(
            "hidden"
        );
    };

    sendBtn.onclick = sendMessage;

    input.addEventListener(
        "keydown",
        e => {

            if (e.key === "Enter") {
                sendMessage();
            }
        }
    );

    async function sendMessage() {

        const text =
            input.value.trim();

        if (!text) return;

        messages.innerHTML += `
            <div class="user-message">
                ${text}
            </div>
        `;

        input.value = "";
        const loading = await showLoading(messages);

        const response =
            await fetch("/chat", {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message: text
                })
            });
        loading.remove();

        const data = await response.json();
        console.log(data);
        if(data.showAdmin){ showAdminButton(); }

        messages.innerHTML += `
    <div class="bot-message">
        ${data.answer}
    </div>
`;

        messages.scrollTop = messages.scrollHeight;

        // ถ้ามีลิงก์
        if (data.link) {

            const overlay = showBuyLoading();
            // ฟังก์ชัน spinner 

            setTimeout(() => {
                overlay.remove();

                window.open(data.link, "_blank");
                // หรือ window.location.href = data.link;
            }, 3000);
        }
    }
}

loadChatWidget();


//=========loading page=========//
function showBuyLoading() {

    const div = document.createElement("div");
    div.id = "buy-overlay";

    div.innerHTML = `
        <div class="buy-box">
            <div class="spinner">👴🏼</div>
            <div>ลุงกำลังพาหลานไปนะ...</div>
        </div>
    `;

    document.body.appendChild(div);

    return div;
}

//============admin=================//
function showAdminButton() {

    const btn =
        document.getElementById("admin-btn");

    btn.classList.remove("hidden");

    btn.innerHTML =
        "💬 ติดต่อทีมงาน";

    btn.classList.remove("small");


    // เด้งเรียกความสนใจ
    btn.classList.add("attention");


    // เอา class ออกหลังเด้งเสร็จ
    setTimeout(() => {
        btn.classList.remove("attention");
    }, 2000);


    // ย่อเป็นไอคอนหลัง 8 วิ
    setTimeout(() => {

        btn.innerHTML = "💬";

        btn.classList.add("small");

    }, 8000);
}

