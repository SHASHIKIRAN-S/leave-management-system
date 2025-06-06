// src/services/api.ts

import axios from 'axios';
import { LeaveRequest, LeaveStatusUpdate, Student, AIRequest, AIResponse } from '../types';

// Define your FastAPI backend URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// Create axios instance with common config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-type': 'application/json',
  },
});

// API service for leave management
export const leaveService = {
  // Get all leave requests
  getAllLeaveRequests: async (): Promise<LeaveRequest[]> => {
    try {
      const response = await apiClient.get('/get_all_leave_requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  },

  // Get leave history for a specific student
  getLeaveHistory: async (studentId: string, status?: string): Promise<LeaveRequest[]> => {
    try {
      const url = status
        ? `/get_leave_history/${studentId}?status=${status}`
        : `/get_leave_history/${studentId}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching leave history for student ${studentId}:`, error);
      throw error;
    }
  },

  // Get leave history by student name
  getLeaveHistoryByName: async (name: string, status?: string): Promise<LeaveRequest[]> => {
    try {
      const url = status
        ? `/get_leave_history_by_name?name=${encodeURIComponent(name)}&status=${status}`
        : `/get_leave_history_by_name?name=${encodeURIComponent(name)}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching leave history for student name ${name}:`, error);
      throw error;
    }
  },

  // Submit a new leave request
  submitLeaveRequest: async (leaveRequest: LeaveRequest): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post('/submit_leave', leaveRequest);
      return response.data;
    } catch (error) {
      console.error('Error submitting leave request:', error);
      throw error;
    }
  },

  // Update leave request status
  updateLeaveStatus: async (update: LeaveStatusUpdate): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post('/update_leave_status', update);
      return response.data;
    } catch (error) {
      console.error('Error updating leave status:', error);
      throw error;
    }
  },

  // Register a new student
  registerStudent: async (student: Student): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post('/register_student', student);
      return response.data;
    } catch (error) {
      console.error('Error registering student:', error);
      throw error;
    }
  },

  // Send AI query
  sendAIQuery: async (request: AIRequest): Promise<AIResponse> => {
    try {
      const response = await apiClient.post('/ai_query', request);
      return response.data;
    } catch (error) {
      console.error('Error sending AI query:', error);
      throw error;
    }
  },

  // --- Get Total Students ---
  getTotalStudents: async (): Promise<{ count: number }> => {
    try {
      const response = await apiClient.get('/get_total_students');
      return response.data;
    } catch (error) {
      console.error('Error fetching total students:', error);
      throw error;
    }
  }, // <--- Ensure this comma is here

  // --- ADDED: Get All Students ---
  getAllStudents: async (): Promise<Student[]> => {
    try {
      const response = await apiClient.get('/get_all_students');
      return response.data;
    } catch (error) {
      console.error('Error fetching all students:', error);
      throw error;
    }
  }
};