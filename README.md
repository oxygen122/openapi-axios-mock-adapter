## openapi-axios-mock-adapter

see: https://github.com/ctimmerm/axios-mock-adapter

### install

`yarn add openapi-axios-mock-adapter -D`

### usage

`yarn generate-axios-mock-adapter openapi-schema.yaml output.ts`

or

```
import generateAxiosMockAdapter from 'openapi-axios-mock-adapter';

generateAxiosMockAdapter('openapi-schema.yaml', 'output.ts');
```

example

```
// generated by generate-axios-mock-adapter
import { AxiosInstance } from "axios";
import * as MockAdapter from "axios-mock-adapter";

const toMock = (axios: AxiosInstance) => {
  const mock = new MockAdapter(axios);

  mock.onPost('/api/endpoint').reply(200,
    { data: 'data' },
  );
...
};

export default toMock;
```
