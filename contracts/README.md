# BlockVote Contracts 

## Pour commencer
```shell 
    git clone git@github.com:AlexisBal/BlockVote-Monorepo.git

    cd BlockVote-Monorepo

    cd contracts
    
    yarn install
```

## Quelques commandes utiles
```shell 
    # Compile les contrats
    yarn compile

    # Lance les tests
    yarn test

    # Lance les tests avec coverage
    yarn test:coverage

    # Démarrer une blockchain en local
    yarn start

    # Forker une blockchain et la démarrer en local
    yarn hardhat node --fork https://your-rpc-url 
```

## Documentation
### Zero Knowledge 
- [What are zero-knowledge proofs?](https://ethereum.org/en/zero-knowledge-proofs/)
- [STARKs vs SNARKs](https://consensys.net/blog/blockchain-explained/zero-knowledge-proofs-starks-vs-snarks/)
- [Anonymous Voting System thanks to ZK Proofs](https://hackernoon.com/how-to-create-an-anonymous-voting-system-on-the-blockchain-using-zero-knowledge-proofs)
- [Build an anonymous voting system with ZK proofs](https://thebojda.medium.com/how-i-built-an-anonymous-voting-system-on-the-ethereum-blockchain-using-zero-knowledge-proof-d5ab286228fd)

### Semaphore
- [Documentation Semaphore](https://semaphore.appliedzkp.org/docs/introduction)
- [Github Semaphore](https://github.com/semaphore-protocol/semaphore)
- [SemaphoreVoting](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/contracts/extensions/SemaphoreVoting.sol)
    
### Utilitaires
- [EnumerableSet](https://docs.openzeppelin.com/contracts/4.x/api/utils#EnumerableSet)
- [AccessControl](https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControl)
- [Clones](https://docs.openzeppelin.com/contracts/4.x/api/proxy#Clones)