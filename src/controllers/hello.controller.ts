import { ApiResponse } from "../types";
import { asyncWrapper } from "../utils";

export const greetingController = asyncWrapper(async (_, res) => {
  res.status(200).json({
    success: true,
    message: "🌟 Welcome to Your Express TypeScript Template! 🚀",
    result: null,
  } satisfies ApiResponse<null>);
});


