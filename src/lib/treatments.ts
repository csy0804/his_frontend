import { api as axios } from "./axios";
import type { Treatment } from "../types";

export interface CreateTreatmentData {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  image?: string;
}

export const createTreatment = async (data: CreateTreatmentData) => {
  const response = await axios.post("/treatments", data);
  return response.data;
};

export const getTreatments = async (): Promise<Treatment[]> => {
  const response = await axios.get("/treatments");
  return response.data;
};

export const getTreatment = async (id: string): Promise<Treatment> => {
  const response = await axios.get(`/treatment/${id}`);
  return response.data;
};

export const updateTreatment = async (id: string, data: Partial<Treatment>) => {
  const response = await axios.put(`/treatments/${id}`, data);
  return response.data;
};

export const deleteTreatment = async (id: string) => {
  const response = await axios.delete(`/treatments/${id}`);
  return response.data;
};

export const getTreatmentsByCategory = async (category: string) => {
  const response = await axios.get(`/treatments/category/${category}`);
  return response.data;
};

export const searchTreatments = async (query: string) => {
  const response = await axios.get(`/treatments/search?q=${encodeURIComponent(query)}`);
  return response.data;
}; 