import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

// 先ほどメモして残していた editionDrop のコントラクトアドレスをこちらに記載してください
const editionDrop = sdk.getContract(
  //"0x67Ca95f69Bd56bc3cF230c2816eC8B2003e44f44",
  "0x1354052f47ccf81e11CAF702C6851849081b3677",
  "edition-drop");

(async () => {
  try {
    await (await editionDrop).createBatch([
      {
        name: "Member's Limited Aetatum Mundi",
        description:
          "Aetatum Mundi にアクセスすることができる限定アイテムです",
        image: readFileSync("src/assets/pathfinder.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();