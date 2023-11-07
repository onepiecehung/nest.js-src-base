import * as Joi from "joi";

export const configValidationSchema = Joi.object({
  PORT: Joi.number().required(),
  JWT_SECRET: Joi.string().min(16).required(),
  DB_TYPE: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow("", null),
  DB_NAME: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().required(),
  // // REDIS_URL: Joi.string().required(),
  // KAKAO_AUTH_ACCESS_LINK: Joi.string().required(),
  // NAVER_AUTH_ACCESS_LINK: Joi.string().required(),
  // MAIL_HOST: Joi.string().required(),
  // MAIL_USER: Joi.string().required(),
  // MAIL_PASS: Joi.string().required(),
  // MAIL_FROM: Joi.string().required(),
  // //   MAIL_ADMIN: Joi.string().required(),
  // AWS_BUCKET_NAME: Joi.string().required(),
  // AWS_ACCESS_KEY: Joi.string().required(),
  // AWS_SECRET_KEY: Joi.string().required(),
  // AWS_REGION: Joi.string().required(),
  // AWS_ENDPOINT: Joi.string().required(),
  // AWS_CLOUDFRONT: Joi.string().required(),
  // //   AI_HOST: Joi.string().required(),
  // //   AI_KEY: Joi.string().required(),
  // APPLE_AUTH_KEY_URL: Joi.string().required(),
  // APPLE_URL: Joi.string().required(),
  // APPLE_CLIENT_ID: Joi.string().required(),
  // //   BE_FAMILY_HOST: Joi.string().required(),
  // // IMP_KEY: Joi.string().required(),
  // // IMP_SECRET: Joi.string().required(),
  // // IMP_AUTH_ACCESS_LINK: Joi.string().required(),
  // FB_AUTH_ACCESS_LINK: Joi.string().required(),
  // TW_AUTH_ACCESS_LINK: Joi.string().required(),
  // TWILIO_ACCOUNT_SID: Joi.string().required(),
  // TWILIO_AUTH_TOKEN: Joi.string().required(),
  // TWILIO_VERIFICATION_SERVICE_SID: Joi.string().required(),
  // TWILIO_SENDER_PHONE_NUMBER: Joi.string().required(),
});

export const config = () => ({
  host: {
    port: Number(process.env.PORT),
    jwtSecret: process.env.JWT_SECRET,
  },

  mysqldb: {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ["dist/**/*.entity{.ts,.js}"],
    autoLoadEntities: true,
    synchronize: !!process.env.SYNCHRONIZE_DATA,
    bigNumberStrings: false,
    supportBigNumbers: true,
    logging: !!process.env.LOGGING_DATA,
    extra: {
      decimalNumbers: true,
    },
  },

  redis: {
    host: process.env.REDIS_URL,
  },

  twilio: {
    twilioAccountSID: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioVerificationServiceSID: process.env.TWILIO_VERIFICATION_SERVICE_SID,
    twilioSenderPhoneNumber: process.env.TWILIO_SENDER_PHONE_NUMBER,
  },
});
