/**
 * Index des ABIs pour les smart contracts
 */

// ABI du contrat Characters
export const CharactersABI = [
  // ERC721 Enumerable Standard
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  
  // Fonctions spécifiques au contrat Characters
  "function mintCharacter(address to, uint8 characterType) payable returns (uint256)",
  "function ownerMint(address to, uint8 characterType, uint8 rarity) returns (uint256)",
  "function setMintPrice(uint256 newPrice)",
  "function setTreasury(address newTreasury)",
  "function setBaseURI(string memory newBaseURI)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function getCharacterStats(uint256 tokenId) view returns (uint8[6])",
  "function isCharacterOfRarity(uint256 tokenId, uint8 rarity) view returns (bool)",
  "function characters(uint256) view returns (string name, uint8 characterType, uint8 rarity, uint8[6] baseStats, uint256 createdAt)",
  "function mintPrice() view returns (uint256)",
  "function treasury() view returns (address)",
  
  // Événements
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event CharacterMinted(address indexed owner, uint256 indexed tokenId, uint8 characterType, uint8 rarity)",
  "event MintPriceChanged(uint256 newPrice)"
];

// ABI fctif du contrat ScoreRegistry (sera implémenté plus tard)
export const ScoreRegistryABI = [
  "function registerScore(uint256 score, uint256 wave, uint256 characterId, bytes calldata signature) payable returns (uint256)",
  "function getHighScore(address player) view returns (uint256)",
  "function getTopScores(uint256 limit) view returns (tuple(address player, uint256 score, uint256 wave, uint256 characterId, uint256 timestamp)[])",
  "function getPlayerScores(address player, uint256 limit) view returns (tuple(uint256 score, uint256 wave, uint256 characterId, uint256 timestamp)[])",
  "function verifyScore(bytes calldata signature, address player, uint256 score, uint256 wave, uint256 characterId) view returns (bool)",
  
  // Événements
  "event ScoreRegistered(address indexed player, uint256 indexed scoreId, uint256 score, uint256 wave, uint256 characterId)"
];
