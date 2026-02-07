declare module 'express' {
  import { Request, Response, NextFunction } from 'express';
  export = express;
  function express(): express.Application;
  namespace express {
    interface Application {
      use: any;
      listen: any;
      get: any;
      post: any;
    }
  }
}
