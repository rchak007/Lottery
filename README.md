# Lottery


![image-20240419015207639](./Images/image-20240419015207639.png)



This lottery smart contract allows participants to place bets using a custom token and potentially win prizes. Here's how it works:

1. **Initialization**: The contract is initialized with parameters including the token name, symbol, purchase ratio (tokens given per ETH paid), bet price (tokens required for a bet placed in the prize pool), and bet fee (tokens required for a bet placed in the owner pool).
2. **Betting**: Participants can purchase tokens by sending ETH to the contract. The number of tokens received is calculated based on the purchase ratio.
3. **Opening Bets**: The owner of the contract can open the lottery for receiving bets by specifying a closing time. Once opened, participants can place their bets.
4. **Placing Bets**: Participants place bets by calling the `bet()` function, transferring the required tokens to the contract. A portion of the tokens go to the prize pool, and another portion goes to the owner pool.
5. **Closing the Lottery**: After the specified closing time, anyone can close the lottery by calling the `closeLottery()` function. The contract then selects a winner randomly from the participants and assigns the prize from the prize pool to the winner.
6. **Withdrawing Prizes**: Winners can withdraw their prizes by calling the `prizeWithdraw()` function, which transfers the prize tokens to their account.
7. **Withdrawing Fees**: The owner can withdraw fees collected in the owner pool by calling the `ownerWithdraw()` function.
8. **Returning Tokens**: Participants can return their tokens and receive the equivalent amount of ETH back by calling the `returnTokens()` function.

It's important to note that the randomness source used in this contract is relatively weak since it relies on the previous block's randao value. Additionally, there may be rounding problems in the token calculations.



## Deploy Lottery Contract



[Lottery Token Smart Contact Solidity code ](https://github.com/rchak007/Lottery/blob/main/Backend/contracts/LotteryToken.sol)

[Lottery Token Smart Contact Solidity code](https://github.com/rchak007/Lottery/blob/main/Backend/contracts/Lottery.sol)



### Deploy Script



[Hardhat deploy script](https://github.com/rchak007/Lottery/blob/main/Backend/scripts/deployLottery.ts)



This script is written in TypeScript and utilizes the Hardhat framework for deploying smart contracts. Hardhat is a development environment for Ethereum that helps developers manage and automate the tasks involved in smart contract development.

Here's a summary of what the script does:

1. **Imports**: The script imports necessary modules from Hardhat and other libraries like `viem`, `dotenv`, and `viem/chains`.
2. **Environment Setup**: It sets up environment variables using `dotenv` to load the the Token contract address and API keys necessary for interacting with the Ethereum network.
3. **Contract ABI and Bytecode**: It imports the ABI and bytecode of the smart contracts `LotteryToken.sol` and `Lottery.sol` from their respective JSON files.
4. **Initialization**: The `initContracts()` function is called to deploy the `Lottery` contract and retrieve its address. It also retrieves the address of the token contract associated with the lottery.
5. **Main Function**: The `main()` function sets up a Viem public client and wallet client using the Alchemy API key. It then calls `initContracts()` to deploy the contracts. However, the deployment of the `Lottery` contract is commented out in this script.
6. **Error Handling**: The script catches and logs any errors that occur during execution.

The advantage of using Hardhat for smart contract deployment is that it provides a robust development environment with built-in tasks for compilation, testing, and deployment. It also offers a wide range of plugins and integrations for interacting with Ethereum networks, making the deployment process more streamlined and efficient.



### 

```bash
Backend> npx hardhat run .\scripts\deployLottery.ts               --network sepolia
Lottery address -  0x77a2bc0577d58aa8e67efa26111540819aeaed0f
Token address -  0x1167E1E1df79887d9533019d494504705e5A6FC0
```



[Lottery Smart contract address](https://sepolia.etherscan.io/address/0x77a2bc0577d58aa8e67efa26111540819aeaed0f)













