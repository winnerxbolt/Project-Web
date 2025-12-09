# Code Citations

## License: unknown
https://github.com/yuta-ike/assessmate/blob/2b6556401215983f4db646bc7e3523abd64f14ac/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() =>
```


## License: unknown
https://github.com/AriTheElk/ihasbeer/blob/ccdacb4f04e2b8cb6e78818f0e3dea841ea9496d/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() =>
```


## License: unknown
https://github.com/wy1009/blog/blob/9c723707d7cedb642d6b305d98d8ea726e80ec0a/source/_posts/Next-js-%E6%9C%AC%E5%9C%B0%E5%BC%80%E5%8F%91%E9%85%8D%E7%BD%AE-https.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() =>
```


## License: unknown
https://github.com/yuta-ike/assessmate/blob/2b6556401215983f4db646bc7e3523abd64f14ac/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) =>
```


## License: unknown
https://github.com/AriTheElk/ihasbeer/blob/ccdacb4f04e2b8cb6e78818f0e3dea841ea9496d/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) =>
```


## License: unknown
https://github.com/wy1009/blog/blob/9c723707d7cedb642d6b305d98d8ea726e80ec0a/source/_posts/Next-js-%E6%9C%AC%E5%9C%B0%E5%BC%80%E5%8F%91%E9%85%8D%E7%BD%AE-https.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) =>
```


## License: unknown
https://github.com/AriTheElk/ihasbeer/blob/ccdacb4f04e2b8cb6e78818f0e3dea841ea9496d/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) =>
```


## License: unknown
https://github.com/wy1009/blog/blob/9c723707d7cedb642d6b305d98d8ea726e80ec0a/source/_posts/Next-js-%E6%9C%AC%E5%9C%B0%E5%BC%80%E5%8F%91%E9%85%8D%E7%BD%AE-https.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) =>
```


## License: unknown
https://github.com/yuta-ike/assessmate/blob/2b6556401215983f4db646bc7e3523abd64f14ac/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) =>
```


## License: unknown
https://github.com/AriTheElk/ihasbeer/blob/ccdacb4f04e2b8cb6e78818f0e3dea841ea9496d/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen
```


## License: unknown
https://github.com/wy1009/blog/blob/9c723707d7cedb642d6b305d98d8ea726e80ec0a/source/_posts/Next-js-%E6%9C%AC%E5%9C%B0%E5%BC%80%E5%8F%91%E9%85%8D%E7%BD%AE-https.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen
```


## License: unknown
https://github.com/yuta-ike/assessmate/blob/2b6556401215983f4db646bc7e3523abd64f14ac/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen
```


## License: unknown
https://github.com/AriTheElk/ihasbeer/blob/ccdacb4f04e2b8cb6e78818f0e3dea841ea9496d/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000
```


## License: ISC
https://github.com/nextauthjs/next-auth/blob/9a2cdce28e49d14461cdbcb874042baacfe1b2fd/docs/versioned_docs/version-v3/providers/apple.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000
```


## License: unknown
https://github.com/wy1009/blog/blob/9c723707d7cedb642d6b305d98d8ea726e80ec0a/source/_posts/Next-js-%E6%9C%AC%E5%9C%B0%E5%BC%80%E5%8F%91%E9%85%8D%E7%BD%AE-https.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000
```


## License: unknown
https://github.com/yuta-ike/assessmate/blob/2b6556401215983f4db646bc7e3523abd64f14ac/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000
```


## License: unknown
https://github.com/Thivieira/firstwaveecommerce/blob/6e9aafca1a6d01250219702e9dac785ab6bba600/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000
```


## License: Apache-2.0
https://github.com/super-dog-human/teraconnect/blob/ff4997e30a5498cbca3c5aedab99ddf4fb0238e7/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(htt
```


## License: ISC
https://github.com/nextauthjs/next-auth/blob/9a2cdce28e49d14461cdbcb874042baacfe1b2fd/docs/versioned_docs/version-v3/providers/apple.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (
```


## License: unknown
https://github.com/wy1009/blog/blob/9c723707d7cedb642d6b305d98d8ea726e80ec0a/source/_posts/Next-js-%E6%9C%AC%E5%9C%B0%E5%BC%80%E5%8F%91%E9%85%8D%E7%BD%AE-https.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (
```


## License: Apache-2.0
https://github.com/super-dog-human/teraconnect/blob/ff4997e30a5498cbca3c5aedab99ddf4fb0238e7/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (
```


## License: unknown
https://github.com/yuta-ike/assessmate/blob/2b6556401215983f4db646bc7e3523abd64f14ac/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (
```


## License: unknown
https://github.com/Thivieira/firstwaveecommerce/blob/6e9aafca1a6d01250219702e9dac785ab6bba600/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (
```


## License: unknown
https://github.com/AriTheElk/ihasbeer/blob/ccdacb4f04e2b8cb6e78818f0e3dea841ea9496d/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (
```


## License: unknown
https://github.com/yuta-ike/assessmate/blob/2b6556401215983f4db646bc7e3523abd64f14ac/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
```


## License: unknown
https://github.com/Thivieira/firstwaveecommerce/blob/6e9aafca1a6d01250219702e9dac785ab6bba600/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
```


## License: unknown
https://github.com/jsjx1995/shimokita-college-library-nextjs/blob/69622b7e9b9ce71ab838851524967610dba69049/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
```


## License: unknown
https://github.com/AriTheElk/ihasbeer/blob/ccdacb4f04e2b8cb6e78818f0e3dea841ea9496d/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
```


## License: ISC
https://github.com/nextauthjs/next-auth/blob/9a2cdce28e49d14461cdbcb874042baacfe1b2fd/docs/versioned_docs/version-v3/providers/apple.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
```


## License: unknown
https://github.com/wy1009/blog/blob/9c723707d7cedb642d6b305d98d8ea726e80ec0a/source/_posts/Next-js-%E6%9C%AC%E5%9C%B0%E5%BC%80%E5%8F%91%E9%85%8D%E7%BD%AE-https.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
```


## License: Apache-2.0
https://github.com/super-dog-human/teraconnect/blob/ff4997e30a5498cbca3c5aedab99ddf4fb0238e7/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
```


## License: Apache-2.0
https://github.com/super-dog-human/teraconnect/blob/ff4997e30a5498cbca3c5aedab99ddf4fb0238e7/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.
```


## License: unknown
https://github.com/yuta-ike/assessmate/blob/2b6556401215983f4db646bc7e3523abd64f14ac/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.
```


## License: unknown
https://github.com/Thivieira/firstwaveecommerce/blob/6e9aafca1a6d01250219702e9dac785ab6bba600/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.
```


## License: unknown
https://github.com/jsjx1995/shimokita-college-library-nextjs/blob/69622b7e9b9ce71ab838851524967610dba69049/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.
```


## License: unknown
https://github.com/AriTheElk/ihasbeer/blob/ccdacb4f04e2b8cb6e78818f0e3dea841ea9496d/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.
```


## License: ISC
https://github.com/nextauthjs/next-auth/blob/9a2cdce28e49d14461cdbcb874042baacfe1b2fd/docs/versioned_docs/version-v3/providers/apple.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.
```


## License: unknown
https://github.com/wy1009/blog/blob/9c723707d7cedb642d6b305d98d8ea726e80ec0a/source/_posts/Next-js-%E6%9C%AC%E5%9C%B0%E5%BC%80%E5%8F%91%E9%85%8D%E7%BD%AE-https.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.
```


## License: unknown
https://github.com/jsjx1995/shimokita-college-library-nextjs/blob/69622b7e9b9ce71ab838851524967610dba69049/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle
```


## License: unknown
https://github.com/AriTheElk/ihasbeer/blob/ccdacb4f04e2b8cb6e78818f0e3dea841ea9496d/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle
```


## License: ISC
https://github.com/nextauthjs/next-auth/blob/9a2cdce28e49d14461cdbcb874042baacfe1b2fd/docs/versioned_docs/version-v3/providers/apple.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle
```


## License: unknown
https://github.com/wy1009/blog/blob/9c723707d7cedb642d6b305d98d8ea726e80ec0a/source/_posts/Next-js-%E6%9C%AC%E5%9C%B0%E5%BC%80%E5%8F%91%E9%85%8D%E7%BD%AE-https.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle
```


## License: Apache-2.0
https://github.com/super-dog-human/teraconnect/blob/ff4997e30a5498cbca3c5aedab99ddf4fb0238e7/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle
```


## License: unknown
https://github.com/yuta-ike/assessmate/blob/2b6556401215983f4db646bc7e3523abd64f14ac/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle
```


## License: unknown
https://github.com/Thivieira/firstwaveecommerce/blob/6e9aafca1a6d01250219702e9dac785ab6bba600/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle
```


## License: unknown
https://github.com/wy1009/blog/blob/9c723707d7cedb642d6b305d98d8ea726e80ec0a/source/_posts/Next-js-%E6%9C%AC%E5%9C%B0%E5%BC%80%E5%8F%91%E9%85%8D%E7%BD%AE-https.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl
```


## License: Apache-2.0
https://github.com/super-dog-human/teraconnect/blob/ff4997e30a5498cbca3c5aedab99ddf4fb0238e7/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl
```


## License: unknown
https://github.com/yuta-ike/assessmate/blob/2b6556401215983f4db646bc7e3523abd64f14ac/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl
```


## License: unknown
https://github.com/Thivieira/firstwaveecommerce/blob/6e9aafca1a6d01250219702e9dac785ab6bba600/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl
```


## License: unknown
https://github.com/jsjx1995/shimokita-college-library-nextjs/blob/69622b7e9b9ce71ab838851524967610dba69049/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl
```


## License: unknown
https://github.com/AriTheElk/ihasbeer/blob/ccdacb4f04e2b8cb6e78818f0e3dea841ea9496d/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl
```


## License: ISC
https://github.com/nextauthjs/next-auth/blob/9a2cdce28e49d14461cdbcb874042baacfe1b2fd/docs/versioned_docs/version-v3/providers/apple.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl
```


## License: unknown
https://github.com/wy1009/blog/blob/9c723707d7cedb642d6b305d98d8ea726e80ec0a/source/_posts/Next-js-%E6%9C%AC%E5%9C%B0%E5%BC%80%E5%8F%91%E9%85%8D%E7%BD%AE-https.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
```


## License: Apache-2.0
https://github.com/super-dog-human/teraconnect/blob/ff4997e30a5498cbca3c5aedab99ddf4fb0238e7/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
```


## License: unknown
https://github.com/yuta-ike/assessmate/blob/2b6556401215983f4db646bc7e3523abd64f14ac/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
```


## License: unknown
https://github.com/Thivieira/firstwaveecommerce/blob/6e9aafca1a6d01250219702e9dac785ab6bba600/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
```


## License: unknown
https://github.com/jsjx1995/shimokita-college-library-nextjs/blob/69622b7e9b9ce71ab838851524967610dba69049/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
```


## License: unknown
https://github.com/AriTheElk/ihasbeer/blob/ccdacb4f04e2b8cb6e78818f0e3dea841ea9496d/server.js

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
```


## License: ISC
https://github.com/nextauthjs/next-auth/blob/9a2cdce28e49d14461cdbcb874042baacfe1b2fd/docs/versioned_docs/version-v3/providers/apple.md

```
= require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync('./certificates/localhost-key.pem'),
  cert: fs.readFileSync('./certificates/localhost.pem')
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
```

