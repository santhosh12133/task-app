import http from '../api/http';

export async function fetchDashboardOverview() {
  const { data } = await http.get('/dashboard/overview');
  return data;
}
