import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { leaveService } from '../api/leaveService';
import { LeaveRequest, LeaveStatusUpdate, StatusCount, Student } from '../types';

interface LeaveContextType {
    leaveRequests: LeaveRequest[];
    loading: boolean;
    error: string | null;
    statusCounts: StatusCount;
    fetchLeaveRequests: () => Promise<void>;
    updateLeaveStatus: (update: LeaveStatusUpdate) => Promise<void>;
    allStudents: Student[];
    fetchAllStudents: () => Promise<void>;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const useLeaveContext = () => {
    const context = useContext(LeaveContext);
    if (!context) {
        throw new Error('useLeaveContext must be used within a LeaveProvider');
    }
    return context;
};

interface LeaveProviderProps {
    children: ReactNode;
}

export const LeaveProvider: React.FC<LeaveProviderProps> = ({ children }) => {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [allStudents, setAllStudents] = useState<Student[]>([]); // Initialized as empty array
    const [statusCounts, setStatusCounts] = useState<StatusCount>({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
    });

    const calculateStatusCounts = useCallback((requests: LeaveRequest[]): StatusCount => {
        const counts = {
            pending: 0,
            approved: 0,
            rejected: 0,
            total: requests.length
        };

        requests.forEach(request => {
            if (request.status === 'pending') counts.pending++;
            else if (request.status === 'approved') counts.approved++;
            else if (request.status === 'rejected') counts.rejected++;
        });

        return counts;
    }, []);

    // Memoize the fetch functions to prevent unnecessary re-renders and re-creations
    const fetchAllStudents = useCallback(async () => {
        // No setLoading(true) here, it's handled by the main useEffect
        setError(null); // Clear error before new attempt
        try {
            const data = await leaveService.getAllStudents();
            setAllStudents(data);
            console.log("LeaveContext - Fetched students data:", data); // Added console log
        } catch (err: any) { // Type 'any' for error for broader catching
            setError('Failed to fetch students. Please try again later.');
            console.error('Error fetching all students:', err);
            setAllStudents([]); // Ensure it's an empty array on error too
        }
        // No setLoading(false) here, it's handled by the main useEffect
    }, []); // Dependencies already fine

    const fetchLeaveRequests = useCallback(async () => {
        // No setLoading(true) here, it's handled by the main useEffect
        setError(null); // Clear error before new attempt
        try {
            const data = await leaveService.getAllLeaveRequests();
            setLeaveRequests(data);
            setStatusCounts(calculateStatusCounts(data));
            console.log("LeaveContext - Fetched leave requests:", data); // Added console log
        } catch (err: any) { // Type 'any' for error for broader catching
            setError('Failed to fetch leave requests. Please try again later.');
            console.error('Error fetching leave requests:', err);
            setLeaveRequests([]); // Ensure it's an empty array on error too
            setStatusCounts({ pending: 0, approved: 0, rejected: 0, total: 0 }); // Reset counts on error
        }
        // No setLoading(false) here, it's handled by the main useEffect
    }, [calculateStatusCounts]); // Dependencies already fine

    const updateLeaveStatus = async (update: LeaveStatusUpdate) => {
        setLoading(true); // Keep loading true during update
        setError(null);
        try {
            await leaveService.updateLeaveStatus(update);
            // After successful update, refetch all data to ensure consistency
            await Promise.all([fetchLeaveRequests(), fetchAllStudents()]); // Refetch both
        } catch (err: any) {
            setError('Failed to update leave status. Please try again.');
            console.error('Error updating leave status:', err);
        } finally {
            setLoading(false); // Set loading false after update attempt
        }
    };

    // Main useEffect to orchestrate initial data fetching
    useEffect(() => {
        const initialFetch = async () => {
            setLoading(true); // Start loading for both fetches
            setError(null); // Clear any previous errors
            try {
                // Use Promise.all to fetch both datasets concurrently
                await Promise.all([fetchLeaveRequests(), fetchAllStudents()]);
            } catch (err: any) {
                // If any of the initial fetches fail, the error will be caught here
                // Note: Individual fetch functions already set specific errors
                // This catch is more for overall initial fetch failures not caught by individual ones
                console.error("Initial data fetch failed:", err);
                // Optionally, you could set a more generic error here if specific ones are not enough
                // setError("Failed to load initial data. Please refresh.");
            } finally {
                setLoading(false); // Ensure loading is false once both are done
            }
        };

        initialFetch();
    }, [fetchLeaveRequests, fetchAllStudents]); // Depend on memoized fetch functions

    const value = {
        leaveRequests,
        loading,
        error,
        statusCounts,
        fetchLeaveRequests,
        updateLeaveStatus,
        allStudents,
        fetchAllStudents
    };

    return <LeaveContext.Provider value={value}>{children}</LeaveContext.Provider>;
};