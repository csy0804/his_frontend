import { api as axios } from "./axios";
import { Appointment, UserFeedback } from "../types"; // Import types from src/types.ts

// Ensure consistency with src/types.ts for Appointment type
export type { Appointment, UserFeedback };

// Define CreateAppointmentData based on OpenAPI NewAppointmentWithDoctor schema
export interface CreateAppointmentData {
  doctor_id: number; // OpenAPI uses integer for doctor_id
  appointment_datetime: string; // OpenAPI uses string (date-time) for appointment_datetime
  reason: string; // OpenAPI uses string for reason
}

// Define UpdateAppointmentData based on OpenAPI UpdateAppointmentWithDoctor schema
export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {
  status?: 'Scheduled' | 'Completed' | 'Cancelled'; // Optional status update
}

// Corresponds to OpenAPI POST /api/v1/appointment
// Expects NewAppointmentWithDoctor payload and returns AvailableAppointmentWithDoctor.
export const createAppointment = async (data: CreateAppointmentData): Promise<Appointment> => {
  const response = await axios.post("/appointment", data); // Use /appointment endpoint
  return response.data; // Assuming response data matches Appointment type from src/types.ts
};

// Corresponds to OpenAPI GET /api/v1/appointments
// Returns array of AvailableAppointmentWithDoctor which aligns with src/types.ts Appointment.
export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await axios.get("/appointments");
  return response.data; // Assuming response data matches Appointment[] from src/types.ts
};

// Corresponds to OpenAPI GET /api/v1/appointment/{id}
// Returns AvailableAppointmentWithDoctor which aligns with src/types.ts Appointment.
export const getAppointment = async (id: number): Promise<Appointment> => { // ID is number in src/types.ts and OpenAPI
  const response = await axios.get(`/appointment/${id}`); // Use /appointment/{id} endpoint
  return response.data; // Assuming response data matches Appointment type from src/types.ts
};

// Corresponds to OpenAPI PATCH /api/v1/appointment/{id}
// Expects UpdateAppointmentWithDoctor payload and returns AvailableAppointmentWithDoctor.
export const updateAppointment = async (id: number, data: UpdateAppointmentData): Promise<Appointment> => { // ID is number
  const response = await axios.patch(`/appointment/${id}`, data); // Use PATCH /appointment/{id} endpoint
  return response.data; // Assuming response data matches Appointment type from src/types.ts
};

// Corresponds to OpenAPI DELETE /api/v1/appointment/{id}
// Returns Feedback.
export const deleteAppointment = async (id: number) => { // ID is number
  const response = await axios.delete(`/appointment/${id}`); // Use DELETE /appointment/{id} endpoint
  return response.data; // Adjust return type based on Feedback schema
};

// OpenAPI spec doesn't explicitly show endpoints for these by doctorId or patientId.
// Keeping them based on previous file content, assuming they are custom or older endpoints.
// Adjusting IDs to number based on src/types.ts.

export const getDoctorAppointments = async (doctorId: number): Promise<Appointment[]> => {
  const response = await axios.get(`/appointments/doctor/${doctorId}`); // Assuming this endpoint exists
  return response.data;
};

export const getPatientAppointments = async (patientId: number): Promise<Appointment[]> => {
  const response = await axios.get(`/appointments/patient/${patientId}`); // Assuming this endpoint exists
  return response.data;
};

// Also adding cancelAppointment based on previous file content, assuming it's a custom endpoint.
// Adjusting ID to number based on src/types.ts.
export const cancelAppointment = async (id: number) => {
  const response = await axios.put(`/appointments/${id}/cancel`); // Assuming this endpoint exists and uses PUT
  return response.data;
}; 