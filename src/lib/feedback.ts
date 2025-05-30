import { api as axios } from "./axios";
import { UserFeedback, FeedbackRate, NewFeedbackInfo, UpdateFeedbackInfo } from "../types"; // Import necessary types from src/types.ts

// Ensure consistency with src/types.ts for UserFeedback type
export type { UserFeedback, FeedbackRate, NewFeedbackInfo, UpdateFeedbackInfo };

// Corresponds to OpenAPI POST /api/v1/{type}/{id}/feedback
// Handles both appointment and treatment feedback creation.
export const createFeedback = async (type: 'appointment' | 'treatment', id: number, data: NewFeedbackInfo): Promise<UserFeedback> => {
  const response = await axios.post(`/${type}/${id}/feedback`, data); // Use dynamic endpoint
  return response.data; // Assuming backend returns the created feedback including ID and other details
};

// Corresponds to OpenAPI PATCH /api/v1/feedback/{id}
export const updateFeedback = async (id: number, data: UpdateFeedbackInfo): Promise<UserFeedback> => { // Feedback ID is number in OpenAPI
  const response = await axios.patch(`/feedback/${id}`, data);
  return response.data; // Assuming backend returns the updated feedback
};

// Corresponds to OpenAPI DELETE /api/v1/feedback/{id}
// OpenAPI returns Feedback schema which has a 'detail' property.
export const deleteFeedback = async (id: number) => { // Feedback ID is number in OpenAPI
  const response = await axios.delete(`/feedback/${id}`);
  return response.data; // Adjust return type based on Feedback schema (e.g., { detail: string })
};

// Corresponds to OpenAPI GET /api/v1/feedbacks
// Returns array of UserFeedback.
export const getUserFeedbacks = async (): Promise<UserFeedback[]> => {
  const response = await axios.get("/feedbacks");
  return response.data; // Assuming response data matches UserFeedback[]
};

// Keeping other utility functions if used elsewhere, ensuring they use number for IDs if appropriate.
// OpenAPI spec doesn't explicitly show endpoints for getting feedback by appointmentId or userId with the same path structure as before.
// Assuming these are older/custom endpoints and adjusting ID types to number if applicable based on context.

// Note: The previous getAppointmentFeedback and getUserFeedback might need re-evaluation based on actual API if different from OpenAPI.
// For now, removing them as they don't align with the provided OpenAPI spec.

// If fetching feedback for a specific appointment or treatment is needed, it might be part of the appointment/treatment details.
// OpenAPI GET /api/v1/appointment/{id} and GET /api/v1/treatment/{id} return objects that include 'feedbacks'.

export const getFeedback = async (id: string) => {
  const response = await axios.get(`/feedback/${id}`);
  return response.data;
};

export const getAppointmentFeedback = async (appointmentId: string) => {
  const response = await axios.get(`/feedback/appointment/${appointmentId}`);
  return response.data;
};

export const getUserFeedback = async (userId: string) => {
  const response = await axios.get(`/feedback/user/${userId}`);
  return response.data;
}; 