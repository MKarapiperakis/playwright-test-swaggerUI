const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// Function to generate default values based on schema type
function generateDefaultValue(schema) {
  switch (schema.type) {
    case 'string':
      return schema.example || 'defaultString';
    case 'number':
      return schema.example || 123;
    case 'boolean':
      return schema.example || true;
    case 'array':
      return schema.example || [];
    case 'object':
      return Object.keys(schema.properties || {}).reduce((acc, key) => {
        acc[key] = generateDefaultValue(schema.properties[key]);
        return acc;
      }, {});
    default:
      return null;
  }
}

function getRequestBodyObject(apiPath, method) {
  const swaggerFile = path.join(__dirname, "swagger.yaml");
  const swaggerContent = fs.readFileSync(swaggerFile, "utf8");
  const swaggerDoc = yaml.load(swaggerContent);

  const apiSpec = swaggerDoc.paths[apiPath] && swaggerDoc.paths[apiPath][method];
  if (!apiSpec) {
    throw new Error(`API path ${apiPath} or method ${method} not found in Swagger document`);
  }

  const requestBody = apiSpec.requestBody;
  if (!requestBody || !requestBody.content || !requestBody.content["application/json"]) {
    throw new Error("Request body or content type 'application/json' not found");
  }

  const schema = requestBody.content["application/json"].schema;
  if (!schema) {
    throw new Error("Schema not found in the Swagger document");
  }

  return JSON.stringify(generateDefaultValue(schema));
}

module.exports = {
  getRequestBodyObject,
};
