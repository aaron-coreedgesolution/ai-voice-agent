import api from "./api";

export const getCallRecords = () => api.get("/calls/");
// export const createCallRecord = (data) => api.post("/calls/", data); // REMOVED: Only webhook creates records
export const startTestCall = (data) => api.post("/calls/start", data);
