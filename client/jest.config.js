module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  }
};
