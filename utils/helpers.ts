import dotevn from "dotenv";
dotevn.config();
import { BitgetAccount } from "./signature";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const accountMain: BitgetAccount = {
  apiKey: process.env.BITGET_API_KEY_MAIN!,
  secretKey: process.env.BITGET_SECRET_KEY_MAIN!,
  passphrase: process.env.BITGET_PASSPHRASE!,
};

export const accountSub20: BitgetAccount = {
  apiKey: process.env.BITGET_API_KEY_SUB_1!,
  secretKey: process.env.BITGET_SECRET_KEY_SUB_1!,
  passphrase: process.env.BITGET_PASSPHRASE!,
};
