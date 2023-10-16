import { sleep } from "./helpers";
import { accountMain, accountSub20 } from "./helpers";
import { BitgetAccount, bitgetRequest } from "./signature";
async function getSubAccountOrder(account: BitgetAccount) {
  const tim = Date.now().toString();
  const endpointPath =
    "/api/v2/mix/account/sub-account-assets?productType=USDT-FUTURES";
  const res = await bitgetRequest(
    account,
    tim,
    "GET",
    endpointPath,
    null,
    null
  );
  return res;
}

async function getAccounts(account: BitgetAccount) {
  const tim = Date.now().toString();
  const endpointPath = "/api/v2/mix/account/accounts?productType=USDT-FUTURES";
  const res = await bitgetRequest(
    account,
    tim,
    "GET",
    endpointPath,
    null,
    null
  );
  return res;
}

async function getOrderDetail(account: BitgetAccount, symbol: string) {
  const tim = Date.now().toString();

  const endpointPath = `/api/v2/mix/order/detail?symbol=${symbol}&productType=USDT-FUTURES`;
  const res = await bitgetRequest(
    account,
    tim,
    "GET",
    endpointPath,
    null,
    null
  );
  return res;
}

async function getOrderFills(account: BitgetAccount, symbol: string) {
  const tim = Date.now().toString();
  const endpointPath = `/api/v2/mix/order/fills?symbol=${symbol}&productType=USDT-FUTURES`;
  const res = await bitgetRequest(
    account,
    tim,
    "GET",
    endpointPath,
    null,
    null
  );

  return res.fillList;
}

async function getSinglePositions(account: BitgetAccount, symbol: string) {
  const tim = Date.now().toString();
  const endpointPath = `/api/v2/mix/position/single-position?symbol=${symbol}&marginCoin=USDT&productType=usdt-futures`;
  const res = await bitgetRequest(
    account,
    tim,
    "GET",
    endpointPath,
    null,
    null
  );
  return res;
}

async function getAllPositions(account: BitgetAccount) {
  const tim = Date.now().toString();
  const endpointPath = `/api/v2/mix/position/all-position?marginCoin=USDT&productType=usdt-futures`;
  const res = await bitgetRequest(
    account,
    tim,
    "GET",
    endpointPath,
    null,
    null
  );
  return res;
}

type FutrueOrder = {
  symbol: string;
  marginMode: string;
  marginCoin: string;
  size: string;
  side: string;
  tradeSide: string;
  orderType: string;
  productType: string;
  price?: string;
};

export async function futureOrder(
  account: BitgetAccount,
  symbol: string,
  size: string,
  price: string,
  tradeSide: "open" | "close",
  side: "buy" | "sell",
  orderType: "limit" | "market"
) {
  const tim = Date.now().toString();
  const endpointPath = `/api/v2/mix/order/place-order`;
  const body: FutrueOrder = {
    symbol: symbol,
    marginMode: "crossed",
    marginCoin: "USDT",
    size: size,
    side: side,
    tradeSide: tradeSide,
    orderType: orderType,
    productType: "USDT-FUTURES",
  };
  if (orderType === "limit") body["price"] = price;
  const res = await bitgetRequest(
    account,
    tim,
    "POST",
    endpointPath,
    null,
    JSON.stringify(body)
  );
  return res;
}
