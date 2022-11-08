export {};

declare global {
  namespace Express {
    interface Request {
      session: {
        session: string;
        type: string;
        username: string;
      };
    }
  }
}
