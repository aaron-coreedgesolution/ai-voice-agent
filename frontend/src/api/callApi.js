import api from "./api";

export const getCallRecords = () => api.get("/calls/");
export const createCallRecord = (data) => api.post("/calls/", data);
export const startTestCall = (data) => api.post("/calls/start", data);
