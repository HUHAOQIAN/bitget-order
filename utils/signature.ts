import { SocksProxyAgent } from "socks-proxy-agent";
import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";
import axios from "axios";
import { sleep } from "../utils/helpers";
export type HeadersBITGET = {
  "Content-Type": "application/json";
  "ACCESS-KEY": string;
  "ACCESS-SIGN": string;
  "ACCESS-TIMESTAMP": string;
  "ACCESS-PASSPHRASE": string;
  locale: "en-US";
};

type SignParams = {
  timestamp: string;
  method: string;
  requestPath: string;
  queryString?: string;
  body?: string;
};

function signatureBitget(params: SignParams, secret: string) {
  let strToSign =
    params.timestamp + params.method.toUpperCase() + params.requestPath;

  if (params.queryString) {
    strToSign += "?" + params.queryString;
  }

  // 添加 body 到签名字符串中，如果 body 不存在，则添加空字符串
  strToSign += params.body || "";

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(strToSign);
  const signature = hmac.digest("base64");
  return signature;
}

function generate(
  timestamp: string,
  method: string,
  requestPath: string,
  queryString: string | null,
  body: string | null,
  secretKey: string
): string {
  method = method.toUpperCase();
  body = body || "";
  queryString = queryString ? "?" + queryString : "";
  const preHash = timestamp + method + requestPath + queryString + body;
  console.log("preHash:", preHash);
  const mac = crypto.createHmac("sha256", secretKey).update(preHash);
  return mac.digest("base64");
}

export type BitgetAccount = {
  apiKey: string;
  secretKey: string;
  passphrase: string;
};
export async function bitgetRequest(
  BitgetAccount: BitgetAccount,
  timestamp: string,
  method: string,
  endpointPath: string,
  queryString: string | null,
  requestBody: string | null, // 修改参数类型
  proxy?: SocksProxyAgent
) {
  const apiKey = BitgetAccount.apiKey;
  const secret = BitgetAccount.secretKey;
  const passphrase = BitgetAccount.passphrase;
  let signature;
  if (method.toUpperCase() === "GET") {
    signature = signatureBitget(
      {
        timestamp: timestamp,
        method: method,
        requestPath: endpointPath,
        queryString: queryString || undefined,
      },
      secret
    );
  } else {
    signature = signatureBitget(
      {
        timestamp: timestamp,
        method: method,
        requestPath: endpointPath,
        // queryString: queryString,
        body: requestBody || "",
      },
      secret
    );
  }

  const headers: HeadersBITGET = {
    "Content-Type": "application/json",
    "ACCESS-KEY": apiKey,
    "ACCESS-SIGN": signature,
    "ACCESS-TIMESTAMP": timestamp,
    "ACCESS-PASSPHRASE": passphrase,
    locale: "en-US",
  };

  let url = `https://api.bitget.com${endpointPath}`;
  if (queryString) {
    url += "?" + queryString;
  }
  try {
    const res = await axios.request({
      url: url,
      method: method,
      headers: headers,
      data: requestBody || undefined, //如何 requestBody 不存在，则传入 undefined
      httpAgent: proxy,
      httpsAgent: proxy,
    });
    return res.data.data;
  } catch (err: any) {
    if (err.response.status === 429) {
      console.log("too many requests, sleep 5s");
      await sleep(5000);
      return await bitgetRequest(
        BitgetAccount,
        timestamp,
        method,
        endpointPath,
        queryString,
        requestBody,
        proxy
      );
    } else if (err.response && err.response.data) {
      throw new Error(
        `error code ${err.response.data.code}, err msg ${err.response.data.msg}`
      );
    } else {
      throw err; // 如果我们不能获取到我们想要的错误信息，我们仍然需要抛出原始的错误对象
    }
  }
}

async function test() {
  const apiKey = process.env.BITGET_API_KEY_LILEI!;
  const secret = process.env.BITGET_SECRET_KEY_LILEI!;
  const passphrase = process.env.BITGET_PASSPHRASE_LILEI!;
  const account: BitgetAccount = {
    apiKey: apiKey,
    secretKey: secret,
    passphrase: passphrase,
  };
  console.log(
    `apiKey is ${apiKey}, secret is ${secret},passphrase is ${passphrase}`
  );
  const requestPath = "/api/mix/v1/market/depth";
  const queryString = "symbol=BTCUSDT_UMCBL&limit=20";

  const requestPath2 = "/api/spot/v1/wallet/deposit-address";
  const body2 = JSON.stringify({
    coin: "BTC",
    chain: "Bitcoin",
  });
  const queryString2 = "coin=USDT&chain=trc20";
  const requestPath3 = "/api/spot/v1/wallet/deposit-list";
  const queryString3 =
    "coin=USDT&startTime=1659036670000&endTime=1659076670000&pageNo=1&pageSize=20";
  // const queryString = "";
  const requestPath4 = "/api/mix/v1/account/account";
  const queryString4 = "symbol=TRXUSDT_UMCBL&marginCoin=USDT";
  const timeStamp = Date.now().toString();
  const signature1 = generate(
    timeStamp,
    "GET",
    requestPath2,
    queryString2,
    "",
    secret
  );
  // const signature2 = signatureBitget(
  //   {
  //     timestamp: timeStamp,
  //     method: "GET",
  //     requestPath: requestPath4,
  //     queryString: queryString4,
  //     body: "",
  //   },
  //   secret
  // );
  // console.log(
  //   `signature1 is ${signature1}, \n signature2 is ${signature2}  ${
  //     signature1 === signature2
  //   }`
  // );
  const res = await bitgetRequest(
    account,
    timeStamp,
    "GET",
    requestPath2,
    queryString2,
    ""
  ).then((res: any) => {
    console.log(res);
  });

  const res2 = await bitgetRequest(
    account,
    timeStamp,
    "GET",
    requestPath3,
    queryString,
    ""
  );
}
