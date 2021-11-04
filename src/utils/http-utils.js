const axios = require('axios');

const httpGet = async function (url) {
  return axios.get(url);
};

module.exports = {
  httpGet,
};
