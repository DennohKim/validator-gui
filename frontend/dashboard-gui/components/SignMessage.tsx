import { useState } from "react";
import { ethers } from "ethers";
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Alert, Box, Button, CircularProgress, Snackbar } from '@mui/material';
import { green } from '@mui/material/colors';

export default function SignMessage({nominator, nominee}: { nominator: string, nominee: string }) {

  const sendTransaction = async (e: any, blobData: any) => {
    setLoading(true);
    try {
      // @ts-ignore
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const [gasPrice, from, nonce] = await Promise.all([
        signer.getGasPrice(),
        signer.getAddress(),
        signer.getTransactionCount()
      ]);

      console.log("BLOB: ", blobData);

      const value = ethers.BigNumber.from(JSON.parse(blobData).stake);

      const params = {
        from,
        to: "0x0000000000000000000000000000000000000001",
        gasPrice,
        gasLimit: 30000000,
        value,
        data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(blobData)),
        nonce
      };
      console.log("Params: ", params);

      const {hash, data, wait} = await signer.sendTransaction(params);
      console.log("TX RECEIPT: ", {hash, data});

      const txConfirmation = await wait();
      console.log("TX CONFRIMED: ", txConfirmation);
      setLoading(false);
      setOpenSnackbar(true);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const signMessage = async ({setError, message}: any) => {
    try {
      // @ts-ignore
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const hash = ethers.utils.hashMessage(message);
      // const hash = hashPersonalMessage(Buffer.from(message, "utf8"));
      console.log("HASH: ", hash);
      const signature = await signer.signMessage(hash);
      console.log("SIGNATURE: ", signature);

      const from = await signer.getAddress();
      return {
        owner: from,
        hash,
        sig: signature
      };
    } catch (err: any) {
      setError(err.message);
    }
  };

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [data, setData] = useState({
    isInternalTx: true,
    internalTXType: 6,
    nominator,
    nominee,
    timestamp: Date.now()
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  // @ts-ignore
  window.ethereum.on("accountsChanged", (accounts: any) => {
    setData({...data, nominator: accounts[0]});
  });

  console.log("DATA: ", data);
  let [isSigned, setSignedStatus] = useState(false);

  const handleSign = async (e: any) => {
    try {
      e.preventDefault();
      const formData = new FormData(e.target).get("message");

      const sign = await signMessage({
        setError,
        message: formData
      });
      if (sign!.sig) {
        setSignedStatus(true);
        // @ts-ignore
        setData({...data, sign});
        console.log("Data af Sig: ", data);
        // setSignatures([...signatures, sig]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSign}>
        <label htmlFor="rewardWallet" className="block">Stake Wallet Address</label>
        <input id="rewardWallet" value={nominator} type="text" className="bg-white text-black p-3 mt-2 w-72 block"
               disabled/>
        <label className="block mt-4">
          Nominee Public Key
        </label>
        <input
          required
          type="text"
          name="nominee"
          className="bg-white text-black p-3 mt-2 w-72 block"
          placeholder="Nominee Public Key"
          value={nominee}
          onChange={(e) =>
            //@ts-ignore
            setData({...data, nominee: e.target.value.toLowerCase()})
          }
        />
        <label className="block mt-4">
          Stake Amount (SHM)
        </label>
        <input
          required
          type="text"
          name="stake"
          className="bg-white text-black p-3 mt-2 w-72"
          placeholder="Stake Amount (SHM)"
          onChange={(e) =>
            setData({
              ...data,
              //@ts-ignore
              stake: ethers.utils
                .parseEther(e.target.value.toString())
                .toString()
            })
          }
        />
      </form>

      <button
        onClick={async (e) => sendTransaction(e, JSON.stringify(data))}
        className="p-3 bg-blue-700 text-stone-200 mr-2 mt-5" disabled={isLoading}
      >
        Stake
        {!isLoading && <ArrowRightIcon className="h-5 w-5 inline ml-2"/>}
        {isLoading && <span className="h-5 w-5 inline ml-2"><CircularProgress size={15} sx={{color: 'white'}} /></span>}
      </button>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleClose}
                anchorOrigin={{horizontal: 'center', vertical: 'top'}}>
        <Alert onClose={handleClose} severity="success" sx={{width: '100%'}}>
          Stake successful!
        </Alert>
      </Snackbar>
    </div>
  )
    ;
}
