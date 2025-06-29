import algosdk from "algosdk";

const algodClient = new algosdk.Algodv2(
  {}, // No headers needed for AlgoNode
  import.meta.env.VITE_ALGO_NETWORK_URL,
  ""
);

const getAccount = () => {
  return algosdk.mnemonicToSecretKey(import.meta.env.VITE_ALGO_MNEMONIC);
};

export const sendVerificationTxn = async (noteData = "Memory by Prachi 🌸") => {
  try {
    const sender = getAccount();
    const params = await algodClient.getTransactionParams().do();

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender.addr,
      to: sender.addr, // Self transfer (for proof)
      amount: 1000, // microAlgos
      note: new TextEncoder().encode(noteData),
      suggestedParams: params,
    });

    const signedTxn = txn.signTxn(sender.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

    await algosdk.waitForConfirmation(algodClient, txId, 4);

    return {
      success: true,
      txId,
      note: noteData,
      explorer: `https://testnet.algoexplorer.io/tx/${txId}`
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
