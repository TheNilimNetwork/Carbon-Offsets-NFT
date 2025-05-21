# MiniCarbon: NFT-Based Carbon Offsetting Certificates

## Slide 1: Title

**MiniCarbon: NFT-Based Carbon Offsetting Certificates**

A Blockchain Solution for Transparent Carbon Credit Trading

---

## Slide 2: Agenda

- Problem Statement
- System Overview
- System Architecture
- Implementation Details
- User Workflows
- Comparison with Existing Solutions
- System Analysis
- Future Work
- References

---

## Slide 3: Problem Statement

- Traditional carbon credit systems lack transparency and trust
- High administrative costs and intermediary fees
- Limited accessibility for small-scale participants
- Difficulty in verifying the authenticity of carbon offset claims
- Double-counting and fraud concerns in existing markets

---

## Slide 4: System Overview

**MiniCarbon** is a blockchain-based platform that:

- Tokenizes carbon offset certificates as NFTs
- Provides transparent verification of carbon offset claims
- Creates a peer-to-peer marketplace for carbon credits
- Reduces administrative costs through smart contracts
- Enables fractional ownership of carbon credits

---

## Slide 5: System Architecture Diagram

```mermaid
graph TD
    subgraph "Frontend Layer"
        UI["User Interface (React)"] --> Web3Provider["Web3Provider Context"]
    end
    subgraph "Middleware Layer"
        Web3Provider --> EthersJS["Ethers.js Library"]
    end
    subgraph "Blockchain Layer"
        EthersJS <--> MetaMask["MetaMask Wallet"]
        MetaMask <--> Ethereum["Ethereum Network (Sepolia)"]
        Ethereum --> SmartContract["CarbonOffsetNFT Contract"]
    end
    subgraph "Storage Layer"
        SmartContract --> OnChain["On-chain Storage"]  
        SmartContract --> IPFS["IPFS Storage"]
    end

    classDef frontend fill:#d4f1f9,stroke:#333,stroke-width:1px;
    classDef middleware fill:#ffe6cc,stroke:#333,stroke-width:1px;
    classDef blockchain fill:#d5e8d4,stroke:#333,stroke-width:1px;
    classDef storage fill:#e1d5e7,stroke:#333,stroke-width:1px;
    
    class UI,Web3Provider frontend;
    class EthersJS middleware;
    class MetaMask,Ethereum,SmartContract blockchain;
    class OnChain,IPFS storage;
```

---

## Slide 6: Architecture Explanation

- **Frontend Layer**: React-based UI with Web3Provider context for wallet integration
- **Middleware Layer**: Ethers.js for blockchain communication
- **Blockchain Layer**: Smart contracts deployed on Sepolia testnet, accessed via MetaMask
- **Storage Layer**: 
  - On-chain storage for transaction data and ownership records
  - IPFS for storing carbon offset documentation and metadata

---

## Slide 7: User Roles

```mermaid
graph TD
    subgraph "User Roles"
        Producer["Carbon Offset Producer"] 
        Admin["Administrator"]
        Buyer["Carbon Credit Buyer"]
    end
    
    subgraph "Platform Components"
        UI["User Interface"]
        Contract["Smart Contract"]
        IPFS["IPFS Storage"]
        Marketplace["NFT Marketplace"]
    end
    
    Producer -->|"Submit Project Details"| UI
    Producer -->|"Upload Documentation"| IPFS
    Producer -->|"Submit Claim"| Contract
    
    Admin -->|"View Pending Claims"| Contract
    Admin -->|"Verify Documentation"| IPFS
    Admin -->|"Approve/Reject Claim"| Contract
    
    Buyer -->|"Browse Marketplace"| Marketplace
    Buyer -->|"View Project Details"| IPFS
    Buyer -->|"Purchase Certificate"| Contract
    
    Contract -->|"Store NFT Metadata"| IPFS
    Contract -->|"List NFT"| Marketplace
```

---

## Slide 8: Implementation - Smart Contract

- **ERC-721 Standard**: NFT implementation for unique carbon certificates
- **Key Functions**:
  - `submitClaim()`: Submit carbon offset project details
  - `approveClaimAndMint()`: Verify claim and mint NFT certificate
  - `rejectClaim()`: Reject invalid claims
  - `listForSale()`: List certificate on marketplace
  - `purchaseCertificate()`: Transfer ownership of certificate

---

## Slide 9: Implementation - Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant Web3 as Web3Provider
    participant MetaMask
    participant Contract as Smart Contract
    
    User->>UI: Click "Connect Wallet"
    UI->>Web3: Call connect()
    Web3->>MetaMask: Request accounts
    MetaMask->>User: Prompt for permission
    User->>MetaMask: Approve connection
    MetaMask->>Web3: Return account address
    Web3->>Web3: Check if admin address
    Web3->>UI: Update connection status
    UI->>Contract: Get user role & permissions
    Contract->>UI: Return role-specific interface
```

---

## Slide 10: Implementation - Carbon Offset Claim Workflow

```mermaid
sequenceDiagram
    actor Producer
    actor Admin
    participant UI as Frontend
    participant Contract as Smart Contract
    participant IPFS
    
    Producer->>UI: Submit project details
    UI->>IPFS: Upload documentation
    IPFS->>UI: Return IPFS hash
    UI->>Contract: Submit claim with IPFS hash
    Contract->>Contract: Store claim in pending state
    
    Admin->>UI: View pending claims
    UI->>Contract: Get pending claims
    Contract->>UI: Return pending claims
    Admin->>UI: Select claim to review
    UI->>IPFS: Retrieve documentation
    IPFS->>UI: Return documentation
    Admin->>UI: Review documentation
    
    alt Claim Approved
        Admin->>UI: Approve claim
        UI->>Contract: Call approveClaimAndMint
        Contract->>Contract: Mint NFT certificate
        Contract->>Contract: Update claim status to approved
    else Claim Rejected
        Admin->>UI: Reject claim
        UI->>Contract: Call rejectClaim
        Contract->>Contract: Update claim status to rejected
    end
```

---

## Slide 11: Implementation - NFT Marketplace Workflow

```mermaid
sequenceDiagram
    actor Producer
    actor Buyer
    participant UI as Frontend
    participant Contract as Smart Contract
    participant IPFS
    
    Producer->>UI: List NFT for sale
    UI->>Contract: Call listForSale with price
    Contract->>Contract: Update NFT listing status
    
    Buyer->>UI: Browse marketplace
    UI->>Contract: Get available listings
    Contract->>UI: Return listings
    Buyer->>UI: View certificate details
    UI->>IPFS: Get certificate metadata
    IPFS->>UI: Return metadata
    UI->>Buyer: Display certificate details
    
    Buyer->>UI: Purchase certificate
    UI->>Contract: Call purchaseCertificate with payment
    Contract->>Contract: Transfer NFT ownership
    Contract->>Contract: Transfer funds to seller
    Contract->>UI: Confirm transaction
    UI->>Buyer: Show ownership confirmation
```

---

## Slide 12: Data Model

```mermaid
erDiagram
    USER ||--o{ CLAIM : submits
    USER ||--o{ NFT : owns
    ADMIN ||--o{ CLAIM : reviews
    CLAIM ||--o{ NFT : mints
    NFT }o--o{ MARKETPLACE : listed_on
    
    USER {
        string address
        boolean isAdmin
        string name
        string email
    }
    
    CLAIM {
        uint256 id
        string ipfsHash
        uint256 carbonAmount
        string projectName
        string location
        ClaimStatus status
        address submitter
    }
    
    NFT {
        uint256 tokenId
        uint256 claimId
        address owner
        uint256 price
        boolean isForSale
    }
    
    MARKETPLACE {
        uint256 listingId
        uint256 tokenId
        uint256 price
        address seller
        boolean active
    }
```

---

## Slide 13: Error Handling Flow

```mermaid
flowchart TD
    Start["User Action"] --> WC{"Wallet Connected?"}
    
    WC -->|"No"| WCE["Show Connect Wallet Message"]
    WCE --> WCA["Attempt Wallet Connection"]
    WCA --> WCS{"Connection Successful?"}
    WCS -->|"No"| WCF["Show Connection Failed Error"]
    WCS -->|"Yes"| CN{"Correct Network?"}
    
    WC -->|"Yes"| CN
    
    CN -->|"No"| CNE["Show Wrong Network Error"]
    CNE --> CNS["Prompt to Switch Network"]
    CNS --> CNSS{"Switch Successful?"}
    CNSS -->|"No"| CNSF["Show Network Switch Failed Error"]
    CNSS -->|"Yes"| BF
    
    CN -->|"Yes"| BF{"Sufficient Balance?"}
    
    BF -->|"No"| BFE["Show Insufficient Funds Error"]
    BF -->|"Yes"| TA["Execute Transaction"]
    
    TA --> TS{"Transaction Successful?"}
    TS -->|"No"| TSE["Show Transaction Failed Error"]
    TSE --> TR{"Retry?"}
    TR -->|"Yes"| TA
    TR -->|"No"| End["End Process"]
    
    TS -->|"Yes"| SC["Show Success Confirmation"]
    SC --> End
```

---

## Slide 14: Comparison with Existing Solutions

| Feature | MiniCarbon | Traditional Carbon Markets | Other Blockchain Solutions |
|---------|------------|----------------------------|----------------------------|
| **Transparency** | Full transparency through blockchain | Limited transparency | Varies by implementation |
| **Verification Process** | Decentralized verification | Centralized authorities | Varies by implementation |
| **Cost** | Low transaction fees | High administrative costs | Medium transaction fees |
| **Accessibility** | Open to all participants | Limited to large entities | Open but technical barriers |
| **Double-counting Prevention** | Guaranteed by blockchain | Manual verification required | Guaranteed by blockchain |
| **Fractional Ownership** | Supported | Limited or not available | Varies by implementation |
| **Market Liquidity** | High through NFT marketplace | Low to medium | Medium |
| **Data Privacy** | Configurable privacy options | Limited data access | Varies by implementation |

---

## Slide 15: Comparison with Research Implementations

| Feature | MiniCarbon | Shielded NFTs (Springer) | Carbon Collectible NFTs |
|---------|------------|--------------------------|-------------------------|
| **Blockchain Platform** | Ethereum (Sepolia) | Custom/Ethereum | Multiple platforms |
| **Privacy Mechanism** | Basic | Zero-knowledge proofs | Basic |
| **Fractional Ownership** | Full support | Full support | Limited support |
| **Verification Method** | Admin verification | Automated with IoT | Manual verification |
| **Energy Efficiency** | Medium (Ethereum-based) | Varies by implementation | Varies by platform |
| **Integration with IoT** | Planned for future | Fully integrated | Limited |
| **Regulatory Compliance** | Basic implementation | GDPR-compliant | Varies |

---

## Slide 16: System Analysis - Strengths

- **Transparency**: Full visibility of carbon offset claims and verification process
- **Immutability**: Once verified, carbon offset data cannot be altered
- **Accessibility**: Lower barriers to entry for small-scale carbon offset producers
- **Cost Efficiency**: Reduced administrative costs through smart contracts
- **Market Efficiency**: Direct peer-to-peer trading without intermediaries
- **Fraud Prevention**: Blockchain prevents double-counting and fraudulent claims

---

## Slide 17: System Analysis - Limitations

- **Scalability Challenges**: Ethereum transaction throughput limitations
- **Energy Consumption**: Blockchain operations have their own carbon footprint
- **Regulatory Uncertainty**: Evolving regulations for blockchain carbon markets
- **Technical Barriers**: Users need basic understanding of blockchain technology
- **Initial Verification**: Still requires trusted verification of initial carbon offset claims
- **Market Adoption**: Requires critical mass of users for marketplace liquidity

---

## Slide 18: Future Work

- Integration with IoT devices for automated carbon measurement
- Implementation of zero-knowledge proofs for enhanced privacy
- Cross-chain compatibility for increased market reach
- Mobile application development for improved accessibility
- Integration with existing carbon credit registries
- Enhanced analytics dashboard for carbon impact visualization
- Implementation of governance mechanisms for community-driven verification

---

## Slide 19: Key Takeaways

- MiniCarbon leverages blockchain technology to create a transparent, efficient carbon offset marketplace
- NFT-based certificates provide unique, verifiable proof of carbon offset ownership
- Smart contracts automate verification and trading processes, reducing costs
- The system addresses key limitations of traditional carbon markets
- Future enhancements will focus on scalability, privacy, and integration with external systems

---

## Slide 20: References

1. Strüker, J., Weibelzahl, M., Körner, MF. et al. (2022). Enabling end-to-end digital carbon emission tracing with shielded NFTs. Energy Informatics, 5(1). https://doi.org/10.1186/s42162-022-00199-3

2. Researchers. (2021). A Blockchain-based Carbon Credit Ecosystem. ResearchGate. https://www.researchgate.net/publication/353056794_A_Blockchain-based_Carbon_Credit_Ecosystem

3. Patel et al. (2020). Carbon Credits on Blockchain. ResearchGate. https://www.researchgate.net/publication/340813301_Carbon_Credits_on_Blockchain

4. Academy of Strategic Management Journal. (2022). Strategic Management of Carbon Footprint Using Carbon Collectible Non-fungible Tokens (NFTs) on Blockchain. https://www.abacademies.org/articles/strategic-management-of-carbon-footprint-using-carbon-collectible-nonfungible-tokens-nfts-on-blockchain-14379.html

5. NFTree. (2021). NFTree – Help to capture CO2 with non-fungible tokens. https://nftree.org/