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
