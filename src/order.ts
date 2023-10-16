import { futureOrder } from "../utils/future-order";
import { sleep, accountMain } from "../utils/helpers";
async function order() {
  let i = 0;
  while (i < 2) {
    const res = await futureOrder(
      accountMain,
      "loomusdt",
      "2000",
      "0.2",
      "open",
      "buy",
      "limit"
    );
    console.log(res);
    await sleep(20);
    i++;
  }
}
order();
