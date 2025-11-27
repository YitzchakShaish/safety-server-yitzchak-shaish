import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  secretString: process.env.JWT_SECRET || "secrateString123456789secrateString";
};
