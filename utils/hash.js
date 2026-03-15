exports.simpleHashToPercentage = (input) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) % 1000000;
  }
  return hash % 100;
};