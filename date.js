var today = new Date();
const options = { weekday: 'long', day: 'numeric', month: 'long' };
today = today.toLocaleDateString("en-US", options);
module.exports = today;