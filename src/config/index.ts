import dotenv from 'dotenv';
dotenv.config();  

export const config = {
  port: process.env.PORT || 3007,
  userRoute: process.env.USER_ROUTE || '/api/users2'
};
