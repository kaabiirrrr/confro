import { getFreelancers } from './services/apiService';
(async () => {
  const res = await getFreelancers({ limit: 100 });
  console.log('Total freelancers returned:', res.data?.length);
  console.log('Sample data:', JSON.stringify(res.data?.[0], null, 2));
})();
