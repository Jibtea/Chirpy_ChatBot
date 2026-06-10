const sessions = {};

export function getSession(sessionId) {

    if (!sessions[sessionId]) {
        sessions[sessionId] = {
            lastResults: null,
            history: []
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