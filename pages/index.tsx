import { useState, useEffect, useMemo } from "react";
import { ConnectWallet, ChainId, useNetwork, useAddress, useContract } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { Proposal } from "@thirdweb-dev/sdk";
import styles from "../styles/Home.module.css";
import { AddressZero } from "@ethersproject/constants";

const Home: NextPage = () => {
  const address = useAddress();
  console.log("ðWallet Address: ", address);

  const [network, switchNetwork] = useNetwork();

  /// editionDrop ã³ã³ãã©ã¯ããåæå
  const editionDrop = useContract(
    //"0x57e748b4C8F38d4f9F7c54dc9A08fC98abF307dA", 
    "0x1354052f47ccf81e11CAF702C6851849081b3677",
    "edition-drop").contract;
  
  // ãã¼ã¯ã³ã³ã³ãã©ã¯ãã®åæå
  const token = useContract("0x2598aE9D8546186441F06695BB4155805A07B1a5", "token").contract;

  //æç¥¨contractã®åæå
  const vote = useContract("0xfe283343b3B89D8CfF7d0A7DC5Fd86bb35c5FBF8", "vote").contract;
  
  // ã¦ã¼ã¶ã¼ãã¡ã³ãã¼ã·ãã NFT ãæã£ã¦ãããã©ãããç¥ãããã®ã¹ãã¼ããå®ç¾©
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  // NFT ããã³ãã£ã³ã°ãã¦ããéãè¡¨ãã¹ãã¼ããå®ç¾©
  const [isClaiming, setIsClaiming] = useState(false);

    // ã¡ã³ãã¼ãã¨ã®ä¿æãã¦ãããã¼ã¯ã³ã®æ°ãã¹ãã¼ãã¨ãã¦å®£è¨
    const [memberTokenAmounts, setMemberTokenAmounts] = useState<any>([]);
  
    // DAO ã¡ã³ãã¼ã®ã¢ãã¬ã¹ãã¹ãã¼ãã§å®£è¨
    const [memberAddresses, setMemberAddresses] = useState<string[] | undefined>([]);

    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [isVoting, setIsVoting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
  
    // ã¢ãã¬ã¹ã®é·ããçç¥ãã¦ãããä¾¿å©ãªé¢æ°
    const shortenAddress = (str: string) => {
      return str.substring(0, 6) + "..." + str.substring(str.length - 4);
    };

      // ã³ã³ãã©ã¯ãããæ¢å­ã®ææ¡ãå¨ã¦åå¾ãã¾ã
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // vote!.getAll() ãä½¿ç¨ãã¦ææ¡ãåå¾ãã¾ã
    const getAllProposals = async () => {
      try {
        const proposals = await vote!.getAll();
        setProposals(proposals);
        console.log("ð Proposals:", proposals);
      } catch (error) {
        console.log("failed to get proposals", error);
      }
    };
    getAllProposals();
  }, [hasClaimedNFT, vote]);

  // ã¦ã¼ã¶ã¼ããã§ã«æç¥¨ãããã©ããç¢ºèªãã¾ã
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // ææ¡ãåå¾ãçµããªãéããã¦ã¼ã¶ã¼ãæç¥¨ãããã©ãããç¢ºèªãããã¨ãã§ããªã
    if (!proposals.length) {
      return;
    }

    const checkIfUserHasVoted = async () => {
      try {
        const hasVoted = await vote!.hasVoted(proposals[0].proposalId.toString(), address);
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("ð¥µ User has already voted");
        } else {
          console.log("ð User has not voted yet");
        }
      } catch (error) {
        console.error("Failed to check if wallet has voted", error);
      }
    };
    checkIfUserHasVoted();

  }, [hasClaimedNFT, proposals, address, vote]);
  
    // ã¡ã³ãã¼ã·ãããä¿æãã¦ããã¡ã³ãã¼ã®å¨ã¢ãã¬ã¹ãåå¾ãã¾ã
    useEffect(() => {
      if (!hasClaimedNFT) {
        return;
      }
  
      // åã»ã©ã¨ã¢ãã­ããããã¦ã¼ã¶ã¼ãããã§åå¾ã§ãã¾ãï¼çºè¡ããã tokenID 0 ã®ã¡ã³ãã¼ã·ãã NFTï¼
      const getAllAddresses = async () => {
        try {
          const memberAddresses = await editionDrop?.history.getAllClaimerAddresses(
            0
          );
          setMemberAddresses(memberAddresses);
          console.log("ð Members addresses", memberAddresses);
        } catch (error) {
          console.error("failed to get member list", error);
        }
      };
      getAllAddresses();
    }, [hasClaimedNFT, editionDrop?.history]);
  
    // åã¡ã³ãã¼ãä¿æãããã¼ã¯ã³ã®æ°ãåå¾ãã¾ã
    useEffect(() => {
      if (!hasClaimedNFT) {
        return;
      }
  
      const getAllBalances = async () => {
        try {
          const amounts = await token?.history.getAllHolderBalances();
          setMemberTokenAmounts(amounts);
          console.log("ð Amounts", amounts);
        } catch (error) {
          console.error("failed to get member balances", error);
        }
      };
      getAllBalances();
    }, [hasClaimedNFT, token?.history]);
  
    // memberAddresses ã¨ memberTokenAmounts ã 1 ã¤ã®éåã«çµåãã¾ã
    const memberList = useMemo(() => {
      return memberAddresses?.map((address) => {
        // memberTokenAmounts éåã§ã¢ãã¬ã¹ãè¦ã¤ãã£ã¦ãããã©ãããç¢ºèªãã¾ã
        // ãã®å ´åãã¦ã¼ã¶ã¼ãæã£ã¦ãããã¼ã¯ã³ã®éãè¿ãã¾ã
        // ããä»¥å¤ã®å ´åã¯ 0 ãè¿ãã¾ã
        const member = memberTokenAmounts?.find(({ holder }: {holder: string}) => holder === address);
  
        return {
          address,
          tokenAmount: member?.balance.displayValue || "0",
        };
      });
    }, [memberAddresses, memberTokenAmounts]);

  useEffect(() => {
    // ããã¦ã©ã¬ããã«æ¥ç¶ããã¦ããªãã£ããå¦çãããªã
    if (!address) {
      return;
    }

    // ã¦ã¼ã¶ã¼ãã¡ã³ãã¼ã·ãã NFT ãæã£ã¦ãããã©ãããç¢ºèªããé¢æ°ãå®ç¾©
    const checkBalance = async () => {
      try {
        const balance = await editionDrop!.balanceOf(address, 0);
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("ð this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("ð­ this user doesn't have a membership NFT.");
        }
      } catch (error) {
        setHasClaimedNFT(false);
        console.error("Failed to get balance", error);
      }
    };

    // é¢æ°ãå®è¡
    checkBalance();
  }, [address, editionDrop]);


  const mintNft = async () => {
    try {
      setIsClaiming(true);
      await editionDrop!.claim("0", 1);
      console.log(
        `ð Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop!.getAddress()}/0`
      );
      setHasClaimedNFT(true);
    } catch (error) {
      setHasClaimedNFT(false);
      console.error("Failed to mint NFT", error);
    } finally {
      setIsClaiming(false);
    }
  };

  // ã¦ã©ã¬ããã¨æ¥ç¶ãã¦ããªãã£ããæ¥ç¶ãä¿ã
  if (!address) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>
            &#127757; Welcome to Aetatum Mundi !!
          </h1>
          <div className={styles.connect}>
            <ConnectWallet />
          </div>
        </main>
      </div>
    );
  } 
  // ãã¹ããããã Goerli ã§ã¯ãªãã£ãå ´åã«è­¦åãè¡¨ç¤º
  else if (address && network && network?.data?.chain?.id !== ChainId.Goerli) {
    console.log("wallet address: ", address);
    console.log("network: ", network?.data?.chain?.id);

    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Goerli ã«åãæ¿ãã¦ãã ããâ ï¸</h1>
          <p>ãã® dApp ã¯ Goerli ãã¹ããããã®ã¿ã§åä½ãã¾ãã</p>
          <p>ã¦ã©ã¬ããããæ¥ç¶ä¸­ã®ãããã¯ã¼ã¯ãåãæ¿ãã¦ãã ããã</p>
        </main>
      </div>
    );
  }

  // DAO ããã·ã¥ãã¼ãç»é¢ãè¡¨ç¤º
  else if (hasClaimedNFT){
    return (
      <div className={styles.container}>
        <main className={styles.main}>
        <h1 className={styles.title}>&#127759; Aetatum Mundi Members&apos; Forum</h1>
        <p>Congratulations on being a member</p>
          <div>
            <div>
              <h2>â  Member List</h2>
              <table className="card">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Token Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {memberList!.map((member) => {
                    return (
                      <tr key={member.address}>
                        <td>{shortenAddress(member.address)}</td>
                        <td>{member.tokenAmount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div>
              <h2>â  Active Proposals</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  // ããã«ã¯ãªãã¯ãé²ãããã«ãã¿ã³ãç¡å¹åãã¾ã
                  setIsVoting(true);

                  // ãã©ã¼ã ããå¤ãåå¾ãã¾ã
                  const votes = proposals.map((proposal) => {
                    const voteResult = {
                      proposalId: proposal.proposalId,
                      vote: 2,
                    };
                    proposal.votes.forEach((vote) => {
                      const elem = document.getElementById(
                        proposal.proposalId + "-" + vote.type
                      ) as HTMLInputElement;

                      if (elem!.checked) {
                        voteResult.vote = vote.type;
                        return;
                      }
                    });
                    return voteResult;
                  });

                  // ã¦ã¼ã¶ã¼ãèªåã®ãã¼ã¯ã³ãæç¥¨ã«å§ã­ããã¨ãç¢ºèªããå¿è¦ãããã¾ã
                  try {
                    // æç¥¨ããåã«ã¦ã©ã¬ããããã¼ã¯ã³ãå§è­²ããå¿è¦ããããã©ãããç¢ºèªãã¾ã
                    const delegation = await token!.getDelegationOf(address);
                    // ãã¼ã¯ã³ãå§è­²ãã¦ããªãå ´åã¯ãæç¥¨åã«å§è­²ãã¾ã
                    if (delegation === AddressZero) {
                      await token!.delegateTo(address);
                    }
                    // ææ¡ã«å¯¾ããæç¥¨ãè¡ãã¾ã
                    try {
                      await Promise.all(
                        votes.map(async ({ proposalId, vote: _vote }) => {
                          // ææ¡ã«æç¥¨å¯è½ãã©ãããç¢ºèªãã¾ã
                          const proposal = await vote!.get(proposalId);
                          // ææ¡ãæç¥¨ãåãä»ãã¦ãããã©ãããç¢ºèªãã¾ã
                          if (proposal.state === 1) {
                            return vote!.vote(proposalId.toString(), _vote);
                          }
                          return;
                        })
                      );
                      try {
                        // ææ¡ãå®è¡å¯è½ã§ããã°å®è¡ãã
                        await Promise.all(
                          votes.map(async ({ proposalId }) => {
                            const proposal = await vote!.get(proposalId);

                            // state ã 4 ã®å ´åã¯å®è¡å¯è½ã¨å¤æ­ãã
                            if (proposal.state === 4) {
                              return vote!.execute(proposalId.toString());
                            }
                          })
                        );
                        // æç¥¨æåã¨å¤å®ãã
                        setHasVoted(true);
                        console.log("successfully voted");
                      } catch (err) {
                        console.error("failed to execute votes", err);
                      }
                    } catch (err) {
                      console.error("failed to vote", err);
                    }
                  } catch (err) {
                    console.error("failed to delegate tokens");
                  } finally {
                    setIsVoting(false);
                  }
                }}
              >
                {proposals.map((proposal) => (
                  <div key={proposal.proposalId.toString()} className="card">
                    <h5>{proposal.description}</h5>
                    <div>
                      {proposal.votes.map(({ type, label }) => (
                        <div key={type}>
                          <input
                            type="radio"
                            id={proposal.proposalId + "-" + type}
                            name={proposal.proposalId.toString()}
                            value={type}
                            // ããã©ã«ãã§æ£æ¨©ç¥¨ããã§ãã¯ãã
                            defaultChecked={type === 2}
                          />
                          <label htmlFor={proposal.proposalId + "-" + type}>
                            {label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <p></p>
                <button disabled={isVoting || hasVoted} type="submit">
                  {isVoting
                    ? "Voting..."
                    : hasVoted
                      ? "You Already Voted"
                      : "Submit Votes"}
                </button>
                <p></p>
                {!hasVoted && (
                  <small>
                    This will trigger multiple transactions that you will need to
                    sign.
                  </small>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    );

  }

  // ã¦ã©ã¬ããã¨æ¥ç¶ããã¦ããã Mint ãã¿ã³ãè¡¨ç¤º
  else {
    return (
        <div className={styles.container}>
          <main className={styles.main}>
            <h1 className={styles.title}>&#127758; Mint your free DAO Membership NFT</h1>
            <button disabled={isClaiming} onClick={mintNft}>
              {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
            </button>
          </main>
        </div>
    );
  }
};

export default Home;
