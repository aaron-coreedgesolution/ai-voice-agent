// src/api/callApi.ts
import api from "./api";

// Define interfaces for request and response types
export interface StartTestCallRequest {
  phoneNumber: string;
  [key: string]: any; // optional extra fields if needed
}

export interface CallRecord {
  id: string;
  created_at: string;
  status: string;
  duration?: number;
  [key: string]: any;
}

export interface GetCallRecordsResponse {
  calls: CallRecord[];
}

// Fetch all call records
export const getCallRecords = async (): Promise<GetCallRecordsResponse> => {
  const response = await api.get<GetCallRecordsResponse>("/calls/");
  return response.data;
};

// Start a test call
export const startTestCall = async (
  data: StartTestCallRequest
): Promise<CallRecord> => {
  const response = await api.post<CallRecord>("/calls/start", data);
  return response.data;
};
