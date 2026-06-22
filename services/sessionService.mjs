import { request } from "express";

const sessions = {};

export function getSession(sessionId) {

    if (!sessions[sessionId]) {
        sessions[sessionId] = {
            lastResults: null,
            history: [],
            // Rate Limit
            requests: [],
            
            questionCount: 0,
            lastActive: Date.now()
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
    console.log(session.requests);
    console.log("dddd");

    return true;
}

// =================================================== //

export function updateQuestionCount(sessionId) {

    const session =
        getSession(sessionId);

    const now = Date.now();

    // ถ้าห่างเกิน 10 นาที รีเซ็ต
    if (now - session.lastActive > 10 * 60 * 1000) {
        session.questionCount = 0;
    }

    session.questionCount++;

    session.lastActive = now;

    return session.questionCount;
}