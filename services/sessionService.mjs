const sessions = {};

export function getSession(sessionId) {

    if (!sessions[sessionId]) {
        sessions[sessionId] = {
            lastResults: null,
            history: [],
            // Rate Limit
            requests: []
        };
    }

    return sessions[sessionId];
}

export function sessionSet(
    sessionId,
    result
) {
    getSession(sessionId).lastResults =
        result;
}

export function updateHistory(
    sessionId,
    question,
    answer
) {

    const session =
        getSession(sessionId);

    session.history.push({
        question,
        answer
    });

    session.history =
        session.history.slice(-5);
}

export function checkRateLimit(sessionId) {

    const session = getSession(sessionId);

    const now = Date.now();


    // เก็บเฉพาะคำถามใน 1 นาทีล่าสุด
    session.requests = session.requests.filter(
        time => now - time < 60 * 1000
    );


    // ถ้าเกิน 5 ครั้ง
    if (session.requests.length >= 5) {

        return false;
    }


    // บันทึกเวลาการถามครั้งใหม่
    session.requests.push(now);

    return true;
}