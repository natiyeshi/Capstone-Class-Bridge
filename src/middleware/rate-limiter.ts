import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 1000000000, // Limit each IP to 1000000000 requests per `window`.
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export default limiter;
