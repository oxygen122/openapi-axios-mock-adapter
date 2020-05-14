import SwaggerParser from '@apidevtools/swagger-parser';
import fs from 'fs';
import * as OpenAPISampler from 'openapi-sampler';
import { OpenAPIV3 } from 'openapi-types';
import toSource from 'tosource';

const parser = new SwaggerParser();

const parseSchema = (response: OpenAPIV3.ResponseObject) => {
  if (
    response.content &&
    response.content['application/json'] &&
    response.content['application/json'].schema
  ) {
    const schema = response.content['application/json'].schema;
    return toSource(
      OpenAPISampler.sample(schema),
      undefined,
      '  ',
      '    ',
    ) as string;
  }
  return '{}';
};

const parseResponse = (responses: OpenAPIV3.ResponsesObject) => {
  const statusCodes = ['200', '201', '204'];
  for (const statusCode of statusCodes) {
    if (responses[statusCode]) {
      return [
        statusCode,
        parseSchema(responses[statusCode] as OpenAPIV3.ResponseObject),
      ] as const;
    }
  }
};

const templateMock = (
  method: string,
  path: string,
  statusCode: string,
  body: string,
) => {
  const upperMethod = method.slice(0, 1).toUpperCase() + method.slice(1);
  return `  mock.on${upperMethod}('${path}').reply(${statusCode},\n    ${body},\n  );\n`;
};

const generateAxiosMockAdapter = (schemaFile: string, output: string) => {
  parser.dereference(schemaFile, (err, api) => {
    if (err) {
      console.error(err);
    } else if (api) {
      const methods = ['get', 'put', 'post', 'delete'] as const;
      const mocks = [
        '// generated by generate-axios-mock-adapter',
        'import { AxiosInstance } from "axios";',
        'import * as MockAdapter from "axios-mock-adapter";\n',
        'const toMock = (axios: AxiosInstance) => {',
        '  const mock = new MockAdapter(axios);\n',
      ];
      for (const pathKey in api.paths) {
        const path: OpenAPIV3.PathItemObject = api.paths[pathKey];
        methods.forEach((method) => {
          const pathMethod = path[method];
          if (pathMethod && pathMethod.responses) {
            const response = parseResponse(pathMethod.responses);
            if (response) {
              mocks.push(
                templateMock(method, pathKey, response[0], response[1]),
              );
            }
          }
        });
      }
      mocks.push('};\n\nexport default toMock;\n');
      fs.writeFileSync(output, mocks.join('\n'));
    }
  });
};

export default generateAxiosMockAdapter;
