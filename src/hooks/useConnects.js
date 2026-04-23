import { useState, useEffect, useCallback } from "react";
import { connectsApi } from "../services/connectsApi";

const getStoredRole = () => localStorage.getItem('user_role');

export const useConnects = (initialFilters = {}) => {
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState(initialFilters);

    const fetchData = useCallback(async () => {
        if (getStoredRole() !== 'FREELANCER') {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [balanceRes, historyRes] = await Promise.all([
                connectsApi.getBalance(),
                connectsApi.getHistory(filters)
            ]);

            if (balanceRes.success) {
                setBalance(balanceRes.data.balance);
            }
            if (historyRes.success) {
                setHistory(historyRes.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return { balance, history, loading, error, filters, updateFilters, refetch: fetchData };
};
