import axios from 'axios';
import { supabase } from '../lib/supabase';

import { getApiUrl } from '../utils/authUtils';
 
const API_URL = getApiUrl();

async function getHeaders(multipart = false) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            ...(multipart ? {} : { 'Content-Type': 'application/json' })
        }
    };
}

export const getPendingOffers = async () => {
    const headers = await getHeaders();
    const { data } = await axios.get(`${API_URL}/api/proposals/client/pending`, headers);
    return data;
};

export const updateProposalStatus = async (id, status) => {
    const headers = await getHeaders();
    const { data } = await axios.patch(`${API_URL}/api/proposals/${id}/status`, { status }, headers);
    return data;
};

