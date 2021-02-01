import axios from 'axios';

const publicFetch = axios.create({
  baseURL: 'https://amyrodriguezcms.herokuapp.com',
  // baseURL: process.env.REACT_APP_API_URL
});

export { publicFetch };
