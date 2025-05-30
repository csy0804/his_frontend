import { api as axios } from "./axios";
import { Doctor } from "../types"; // Import Doctor type from src/types.ts

// Use the Doctor type from src/types.ts for consistency
export type { Doctor };

// Define CreateDoctorData based on the expected payload for creating a doctor
// This might be different from the Doctor interface itself.
// Assuming the backend expects data like fullname, speciality, email, phone, etc. for creation.
// Based on src/types.ts, Doctor ID is number.
// OpenAPI spec doesn't show a POST /doctors endpoint, this interface and function are based on context.
export interface CreateDoctorData {
  fullname: string;
  speciality: string; // Assuming single speciality for creation
  profile?: string | null;
  working_days: string[];
  department_name: string;
  email: string;
  phone: string;
  // Add other fields if required by the backend POST endpoint for doctors.
}

// Assuming a POST /doctors endpoint exists based on previous context, though not in provided OpenAPI spec.
export const createDoctor = async (data: CreateDoctorData): Promise<Doctor> => {
  const response = await axios.post("/doctors", data);
  return response.data; // Assuming backend returns the created Doctor object matching src/types.ts
};

// Corresponds to OpenAPI GET /api/v1/doctors
// Returns a list of AvailableDoctor which aligns with src/types.ts Doctor.
export const getDoctors = async (): Promise<Doctor[]> => {
  const response = await axios.get("/doctors");
  return response.data; // Assuming the response structure matches Doctor[] from src/types.ts
};

// Corresponds to OpenAPI GET /api/v1/doctor/{id}
// Returns DoctorDetails which contains nested Speciality with appointment_charges.
export const getDoctor = async (id: number): Promise<Doctor> => { // ID is number in src/types.ts and OpenAPI
  const response = await axios.get(`/doctor/${id}`); // Use /doctor/{id} endpoint from OpenAPI
  // Assuming DoctorDetails structure is compatible or a subset of src/types.ts Doctor for display.
  // If significant differences, a separate type or mapping might be needed.
  return response.data; // Assuming the response can be treated as Doctor type from src/types.ts
};

// No direct corresponding PATCH or DELETE /doctors endpoint in OpenAPI, using /doctor/{id}.
// Assuming these operations are on a single doctor by ID (number).
export const updateDoctor = async (id: number, data: Partial<CreateDoctorData>): Promise<Doctor> => {
  const response = await axios.patch(`/doctor/${id}`, data); // Assuming PATCH /doctor/{id} for update
  return response.data; // Assuming backend returns the updated Doctor object matching src/types.ts
};

export const deleteDoctor = async (id: number) => {
  const response = await axios.delete(`/doctor/${id}`); // Assuming DELETE /doctor/{id} for delete
  return response.data; // Adjust return type based on actual API response (e.g., success message)
};

// Corresponds to OpenAPI GET /api/v1/specialities
// Returns a list of strings.
export const getSpecialities = async (): Promise<string[]> => {
  const response = await axios.get("/specialities");
  // OpenAPI spec shows array of strings directly.
  return response.data; 
};

// Corresponds to OpenAPI GET /api/v1/doctors with speciality_name and at query parameters.
// Returns a list of AvailableDoctor which aligns with src/types.ts Doctor.
export const getDoctorsBySpecialization = async (speciality: string, datetime: string): Promise<Doctor[]> => {
  const response = await axios.get("/doctors", {
    params: {
      speciality_name: speciality, // Use speciality_name query parameter from OpenAPI
      at: datetime, // Use at query parameter from OpenAPI
    },
  });
  return response.data; // Assuming the response structure matches Doctor[] from src/types.ts
};

// Derived from OpenAPI GET /api/v1/doctor/{id} response (DoctorDetails -> Speciality -> appointment_charges).
export const getDoctorCharges = async (doctorId: number): Promise<number> => { // doctorId is number
  const response = await axios.get(`/doctor/${doctorId}`); // Fetch doctor details using /doctor/{id}
  // Assuming response.data is DoctorDetails as per OpenAPI spec for /doctor/{id}.
  // DoctorDetails has a nested 'speciality' object with 'appointment_charges'.
  return response.data.speciality.appointment_charges; // Access charges from nested structure
};

// Other utility functions if used elsewhere, ensure they use number for doctor IDs where appropriate.
// OpenAPI spec doesn't explicitly show endpoints for these by department, search, or schedule by ID.
// Keeping them based on previous file content, assuming they are custom or older endpoints.
// Adjusting doctorId parameter to number based on src/types.ts.

export const getDoctorsByDepartment = async (department: string): Promise<Doctor[]> => {
  const response = await axios.get(`/doctors/department/${department}`); // Assuming this endpoint exists
  return response.data;
};

export const searchDoctors = async (query: string): Promise<Doctor[]> => {
  const response = await axios.get(`/doctors/search?q=${encodeURIComponent(query)}`); // Assuming this endpoint exists
  return response.data;
};

export const getDoctorSchedule = async (doctorId: number, date: string) => { // doctorId is number
  const response = await axios.get(`/doctors/${doctorId}/schedule?date=${date}`); // Assuming this endpoint exists
  return response.data; // Adjust return type based on actual API response structure
}; 