import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://tanya.dvarmalchus.co.il', // Assuming this is the base URL based on Parse config
});

export default instance;
