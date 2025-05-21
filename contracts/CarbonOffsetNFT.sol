// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Custom errors for gas efficiency
error InvalidCO2Offset();
error InvalidIPFSHash();
error InvalidProjectName();
error InvalidDescription();
error ClaimDoesNotExist();
error NotClaimant();
error NotPending();
error AlreadyListed();
error NotListed();
error InsufficientFunds();
error InvalidPrice();

// CarbonOffsetNFT contract for managing carbon offset certificates
contract CarbonOffsetNFT is ERC721, ERC721Burnable, ERC721URIStorage, Ownable, ReentrancyGuard {
    // Enum for claim status
    enum ClaimStatus { Pending, Approved, Rejected }

    // Struct for carbon offset claims
    struct Claim {
        string projectName;
        string description;
        uint256 co2Offset; // In tonnes
        string ipfsHash; // Documentation hash
        address claimant;
        ClaimStatus status;
    }

    // State variables
    uint256 private _claimIdCounter;
    mapping(uint256 => Claim) public claims;
    uint256 private _totalSupply;
    mapping(uint256 => uint256) public tokenToClaim; // Maps tokenId to claimId
    mapping(uint256 => uint256) public tokenPrices; // Marketplace: tokenId => price
    mapping(address => uint256[]) private _userClaimIds; // Maps user address to their claim IDs
    address public externalToken; // Optional external token address (e.g., for future interoperability)

    // Events
    event ClaimSubmitted(uint256 indexed claimId, address indexed claimant, string projectName, uint256 co2Offset, string ipfsHash);
    event ClaimApproved(uint256 indexed claimId, uint256 indexed tokenId);
    event ClaimRejected(uint256 indexed claimId, string reason);
    event TokenBurned(uint256 indexed tokenId);
    event TokenListed(uint256 indexed tokenId, uint256 price);
    event TokenUnlisted(uint256 indexed tokenId);
    event TokenPurchased(uint256 indexed tokenId, address indexed buyer, uint256 price);

    // Constructor: Set admin as predefined address
    constructor()
        ERC721("CarbonOffsetCertificate", "COC")
    {
        _transferOwnership(0xAd64703C63FA940c909D0BD54a76025fD89DEb4B);
    }

    // Submit a carbon offset claim
    function submitClaim(
        uint256 co2Offset,
        string memory projectName,
        string memory description,
        string memory ipfsHash
    ) external nonReentrant {
        if (co2Offset == 0) revert InvalidCO2Offset();
        if (bytes(projectName).length == 0) revert InvalidProjectName();
        if (bytes(description).length == 0) revert InvalidDescription();
        if (bytes(ipfsHash).length != 46) revert InvalidIPFSHash();

        uint256 claimId = _claimIdCounter++;
        claims[claimId] = Claim({
            projectName: projectName,
            description: description,
            co2Offset: co2Offset,
            ipfsHash: ipfsHash,
            claimant: msg.sender,
            status: ClaimStatus.Pending
        });

        // Add claim to user's claims array
        _userClaimIds[msg.sender].push(claimId);

        emit ClaimSubmitted(claimId, msg.sender, projectName, co2Offset, ipfsHash);
    }

    // Approve a claim and mint NFT (owner only)
    function approveClaim(uint256 claimId, string memory tokenURI) external onlyOwner nonReentrant {
        Claim storage claim = claims[claimId];
        if (claim.claimant == address(0)) revert ClaimDoesNotExist();
        if (claim.status != ClaimStatus.Pending) revert NotPending();

        claim.status = ClaimStatus.Approved;
        uint256 tokenId = totalSupply();
        tokenToClaim[tokenId] = claimId;
        _safeMint(claim.claimant, tokenId);
        _totalSupply++;
        _setTokenURI(tokenId, tokenURI);

        emit ClaimApproved(claimId, tokenId);
    }

    // Get total number of claims for a user
    function getUserClaimCount(address user) external view returns (uint256) {
        return _userClaimIds[user].length;
    }

    // Get claim ID at specific index for a user
    function userClaimIds(address user, uint256 index) external view returns (uint256) {
        require(index < _userClaimIds[user].length, "Index out of bounds");
        return _userClaimIds[user][index];
    }

    // Get total number of claims
    function getClaimCount() external view returns (uint256) {
        return _claimIdCounter;
    }

    // Reject a claim (owner only)
    function rejectClaim(uint256 claimId, string memory reason) external onlyOwner {
        Claim storage claim = claims[claimId];
        if (claim.claimant == address(0)) revert ClaimDoesNotExist();
        if (claim.status != ClaimStatus.Pending) revert NotPending();

        claim.status = ClaimStatus.Rejected;
        emit ClaimRejected(claimId, reason);
    }

    // Set external token address (e.g., for future interoperability, owner only)
    function setExternalToken(address tokenAddress) external onlyOwner {
        externalToken = tokenAddress;
    }

    // List NFT for sale
    function listToken(uint256 tokenId, uint256 price) external nonReentrant {
        if (!_exists(tokenId)) revert ClaimDoesNotExist();
        if (ownerOf(tokenId) != msg.sender) revert NotClaimant();
        if (price == 0) revert InvalidPrice();
        if (tokenPrices[tokenId] > 0) revert AlreadyListed();

        tokenPrices[tokenId] = price;
        emit TokenListed(tokenId, price);
    }

    // Unlist NFT
    function unlistToken(uint256 tokenId) external nonReentrant {
        if (!_exists(tokenId)) revert ClaimDoesNotExist();
        if (ownerOf(tokenId) != msg.sender) revert NotClaimant();
        if (tokenPrices[tokenId] == 0) revert NotListed();

        tokenPrices[tokenId] = 0;
        emit TokenUnlisted(tokenId);
    }

    // Purchase NFT
    function purchaseToken(uint256 tokenId) external payable nonReentrant {
        if (!_exists(tokenId)) revert ClaimDoesNotExist();
        uint256 price = tokenPrices[tokenId];
        if (price == 0) revert NotListed();
        if (msg.value < price) revert InsufficientFunds();

        address seller = ownerOf(tokenId);
        tokenPrices[tokenId] = 0;
        _transfer(seller, msg.sender, tokenId);

        // Transfer ETH to seller
        (bool sent, ) = seller.call{value: price}("");
        require(sent, "ETH transfer failed");

        // Refund excess ETH
        if (msg.value > price) {
            (bool refunded, ) = msg.sender.call{value: msg.value - price}("");
            require(refunded, "Refund failed");
        }

        emit TokenPurchased(tokenId, msg.sender, price);
    }

    // Override burn to emit event
    function burn(uint256 tokenId) public override {
        require(_exists(tokenId), "Token does not exist");
        super.burn(tokenId);
        emit TokenBurned(tokenId);
    }

    // Override tokenURI to return IPFS metadata
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        uint256 claimId = tokenToClaim[tokenId];
        Claim memory claim = claims[claimId];
        return string(abi.encodePacked("ipfs://", claim.ipfsHash));
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    // Override required by ERC721Enumerable
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Internal function to set token URI

}