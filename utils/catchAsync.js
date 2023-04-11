// This function takes an asynchronous function `fn` as an argument and returns a new function that
// can be used as middleware in a Node.js application
module.exports = fn => (req, res, next) => {
  // The returned function takes three arguments: `req`, `res`, and `next`. Inside this function,
  // the original `fn` function is called with these three arguments, and a `catch` block is used
  // to handle any errors that might occur during the execution of the `fn` function
  fn(req, res, next).catch(next);
};
