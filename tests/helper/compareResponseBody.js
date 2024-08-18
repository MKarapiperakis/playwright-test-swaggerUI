const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function compareResultWithSwagger(obj, apiPath, subPath = "", method) {
  const swaggerFile = path.join(__dirname, "swagger.yaml");
  const swaggerContent = fs.readFileSync(swaggerFile, "utf8");
  const swaggerDoc = yaml.load(swaggerContent);

  // Get the sample object from the input object based on subPath
  const sampleObject = getNestedObject(obj, subPath);
  const sampleKeys = sampleObject ? Object.keys(sampleObject) : [];

  // Retrieve the example response from Swagger
  const swaggerResponse =
    swaggerDoc.paths[apiPath][method].responses["200"].content[
      "application/json"
    ].example;

  // Get the response object from Swagger based on subPath
  const responseObject = getNestedObject(swaggerResponse, subPath);
  const responseKeys = responseObject ? Object.keys(responseObject) : [];

  return haveSameValues(sampleKeys, responseKeys);
}

function haveSameValues(array1, array2) {
  const set1 = new Set(array1);
  const set2 = new Set(array2);

  if (set1.size !== set2.size) {
    return false;
  }

  for (const item of set1) {
    if (!set2.has(item)) {
      return false;
    }
  }
  return true;
}

function getNestedObject(obj, subPath) {
  const keys = subPath.split('.').reduce((acc, key) => {
      const parts = key.split(/\[([0-9]+)\]/).filter(Boolean);
      return acc.concat(parts);
  }, []);

  return keys.reduce((acc, key) => acc && acc[key], obj);
}

module.exports = {
  compareResultWithSwagger,
};
