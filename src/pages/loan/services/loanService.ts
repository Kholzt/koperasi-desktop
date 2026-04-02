import axios from '../../../utils/axios';

export interface LoanFetchParams {
  page?: number;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  day?: string | null;
  group?: string | null;
  pos?: string | null;
  search?: string | null;
}

export async function getLoans(params: LoanFetchParams) {
  const p = params.page || 1;
  const status = params.status || '';
  const startDate = params.startDate || '';
  const endDate = params.endDate || '';
  const day = params.day || '';
  const group = params.group || '';
  const pos = params.pos || '';
  const search = params.search || '';

  const url = `/api/loans?page=${p}&pos=${encodeURIComponent(pos)}&status=${encodeURIComponent(status)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&day=${encodeURIComponent(day)}&group=${encodeURIComponent(group)}&search=${encodeURIComponent(search)}`;
  const res = await axios.get(url);
  return res.data;
}

export async function getGroups(limit = 20000000,pos = "") {
 try {
    const res = await axios.get(`/api/groups?limit=${limit}&pos=${pos}`);
    return res.data;
 } catch (error) {
    console.log(error);
    
 }
}

export async function getPos(limit = 20000000) {
  const res = await axios.get(`/api/pos?limit=${limit}`);
  return res.data;
}
