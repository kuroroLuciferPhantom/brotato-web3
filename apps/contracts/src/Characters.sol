// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title Characters
 * @dev Contrat pour la gestion des personnages (NFTs) du jeu Brotato Web3
 */
contract Characters is ERC721Enumerable, Ownable {
    using Strings for uint256;

    // Structure pour stocker les attributs d'un personnage
    struct Character {
        string name;
        uint8 characterType; // Type du personnage (0: Guerrier, 1: Archer, etc.)
        uint8 rarity; // Rareté (0: Commun, 1: Rare, 2: Épique, 3: Légendaire)
        uint8[6] baseStats; // [vitesse, dégâts, santé, récolte, chance, armure]
        uint256 createdAt;
    }
    
    // Mapping des données de personnages
    mapping(uint256 => Character) public characters;
    
    // Compteur pour l'ID du prochain personnage
    uint256 private _nextCharacterId = 1;
    
    // Prix de mint
    uint256 public mintPrice = 0.01 ether;
    
    // Adresse du trésor pour les revenus
    address public treasury;
    
    // URI de base pour les métadonnées
    string private _baseTokenURI;
    
    // Événements
    event CharacterMinted(address indexed owner, uint256 indexed tokenId, uint8 characterType, uint8 rarity);
    event MintPriceChanged(uint256 newPrice);
    
    // Noms des types de personnages
    string[] private _characterTypeNames = ["Warrior", "Archer", "Mage", "Rogue", "Tank", "Support"];
    
    // Noms des raretés
    string[] private _rarityNames = ["Common", "Rare", "Epic", "Legendary"];

    /**
     * @dev Constructeur du contrat
     * @param name Nom de la collection NFT
     * @param symbol Symbole de la collection NFT
     * @param treasuryAddress Adresse du trésor pour les revenus
     */
    constructor(
        string memory name,
        string memory symbol,
        address treasuryAddress,
        string memory baseTokenURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        require(treasuryAddress != address(0), "Treasury address cannot be zero");
        treasury = treasuryAddress;
        _baseTokenURI = baseTokenURI;
    }
    
    /**
     * @dev Mint d'un nouveau personnage
     * @param to Adresse du destinataire
     * @param characterType Type du personnage
     * @return ID du token mint
     */
    function mintCharacter(address to, uint8 characterType) public payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(characterType < _characterTypeNames.length, "Invalid character type");
        
        uint256 tokenId = _nextCharacterId++;
        
        // Générer une rareté aléatoire (biaisée vers les raretés communes)
        uint8 rarity = _generateRarity();
        
        // Générer les stats de base en fonction du type et de la rareté
        uint8[6] memory baseStats = _generateBaseStats(characterType, rarity);
        
        // Créer le personnage
        characters[tokenId] = Character({
            name: string(abi.encodePacked(_characterTypeNames[characterType], " #", tokenId.toString())),
            characterType: characterType,
            rarity: rarity,
            baseStats: baseStats,
            createdAt: block.timestamp
        });
        
        // Mint le NFT
        _mint(to, tokenId);
        
        // Transférer les fonds au trésor
        (bool sent, ) = treasury.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
        
        emit CharacterMinted(to, tokenId, characterType, rarity);
        
        return tokenId;
    }
    
    /**
     * @dev Mint par le propriétaire (pour les récompenses, événements, etc.)
     * @param to Adresse du destinataire
     * @param characterType Type du personnage
     * @param rarity Rareté forcée
     * @return ID du token mint
     */
    function ownerMint(address to, uint8 characterType, uint8 rarity) public onlyOwner returns (uint256) {
        require(characterType < _characterTypeNames.length, "Invalid character type");
        require(rarity < _rarityNames.length, "Invalid rarity");
        
        uint256 tokenId = _nextCharacterId++;
        
        // Générer les stats de base en fonction du type et de la rareté
        uint8[6] memory baseStats = _generateBaseStats(characterType, rarity);
        
        // Créer le personnage
        characters[tokenId] = Character({
            name: string(abi.encodePacked(_characterTypeNames[characterType], " #", tokenId.toString())),
            characterType: characterType,
            rarity: rarity,
            baseStats: baseStats,
            createdAt: block.timestamp
        });
        
        // Mint le NFT
        _mint(to, tokenId);
        
        emit CharacterMinted(to, tokenId, characterType, rarity);
        
        return tokenId;
    }
    
    /**
     * @dev Change le prix de mint
     * @param newPrice Nouveau prix en wei
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
        emit MintPriceChanged(newPrice);
    }
    
    /**
     * @dev Change l'adresse du trésor
     * @param newTreasury Nouvelle adresse du trésor
     */
    function setTreasury(address newTreasury) public onlyOwner {
        require(newTreasury != address(0), "Treasury address cannot be zero");
        treasury = newTreasury;
    }
    
    /**
     * @dev Change l'URI de base pour les métadonnées
     * @param newBaseURI Nouvelle URI de base
     */
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
    }
    
    /**
     * @dev Obtenir l'URI d'un token
     * @param tokenId ID du token
     * @return URI du token
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        // Si baseURI est définie, on l'utilise comme lien externe
        if (bytes(_baseTokenURI).length > 0) {
            return string(abi.encodePacked(_baseTokenURI, tokenId.toString()));
        }
        
        // Sinon, on génère des métadonnées on-chain
        return _generateOnChainMetadata(tokenId);
    }
    
    /**
     * @dev Obtenir les stats d'un personnage
     * @param tokenId ID du token
     * @return Stats du personnage
     */
    function getCharacterStats(uint256 tokenId) public view returns (uint8[6] memory) {
        _requireOwned(tokenId);
        return characters[tokenId].baseStats;
    }
    
    /**
     * @dev Vérifier si un personnage est d'une certaine rareté
     * @param tokenId ID du token
     * @param rarity Rareté à vérifier
     * @return Vrai si le personnage est de la rareté spécifiée
     */
    function isCharacterOfRarity(uint256 tokenId, uint8 rarity) public view returns (bool) {
        _requireOwned(tokenId);
        return characters[tokenId].rarity == rarity;
    }
    
    // Fonctions internes
    
    /**
     * @dev Génère une rareté aléatoire biaisée
     * @return Rareté générée
     */
    function _generateRarity() private view returns (uint8) {
        // Probabilités: Commun (70%), Rare (20%), Épique (9%), Légendaire (1%)
        uint256 rand = uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, msg.sender, _nextCharacterId))) % 100;
        
        if (rand < 70) return 0; // Commun
        if (rand < 90) return 1; // Rare
        if (rand < 99) return 2; // Épique
        return 3; // Légendaire
    }
    
    /**
     * @dev Génère les stats de base d'un personnage
     * @param characterType Type du personnage
     * @param rarity Rareté du personnage
     * @return Stats générées
     */
    function _generateBaseStats(uint8 characterType, uint8 rarity) private view returns (uint8[6] memory) {
        uint8[6] memory stats;
        uint256 seed = uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, msg.sender, _nextCharacterId)));
        
        // Multiplicateur de rareté
        uint8[4] memory rarityMultipliers = [10, 12, 15, 20]; // Commun, Rare, Épique, Légendaire
        uint8 multiplier = rarityMultipliers[rarity];
        
        // Stats de base selon le type de personnage (personnalisé par type)
        if (characterType == 0) { // Guerrier
            stats = [5, 8, 7, 5, 4, 6];
        } else if (characterType == 1) { // Archer
            stats = [7, 7, 5, 6, 5, 4];
        } else if (characterType == 2) { // Mage
            stats = [4, 9, 4, 5, 7, 3];
        } else if (characterType == 3) { // Voleur
            stats = [8, 6, 4, 7, 8, 2];
        } else if (characterType == 4) { // Tank
            stats = [3, 5, 10, 4, 3, 9];
        } else { // Support
            stats = [5, 4, 6, 8, 6, 5];
        }
        
        // Appliquer le multiplicateur et ajouter une variation aléatoire
        for (uint8 i = 0; i < 6; i++) {
            // Calcul du bonus de rareté
            uint8 baseValue = stats[i];
            uint8 rarityBonus = (baseValue * multiplier) / 10;
            
            // Légère variation aléatoire (+/- 10%)
            uint8 randomVariation = uint8((seed % 21) - 10); // -10 à +10
            seed = seed / 21;
            
            // Nouvelle valeur avec bonus et variation
            int16 newValue = int16(rarityBonus) + int16(randomVariation * rarityBonus) / 100;
            
            // S'assurer que la valeur est positive et ne dépasse pas 255
            if (newValue < 1) newValue = 1;
            if (newValue > 255) newValue = 255;
            
            stats[i] = uint8(newValue);
        }
        
        return stats;
    }
    
    /**
     * @dev Génère les métadonnées on-chain pour un token
     * @param tokenId ID du token
     * @return Métadonnées encodées en Base64
     */
    function _generateOnChainMetadata(uint256 tokenId) private view returns (string memory) {
        Character memory character = characters[tokenId];
        
        // Construire le JSON des attributs
        string memory attributes = string(abi.encodePacked(
            '[{"trait_type":"Character Type","value":"', _characterTypeNames[character.characterType], '"},',
            '{"trait_type":"Rarity","value":"', _rarityNames[character.rarity], '"},',
            '{"trait_type":"Speed","value":', Strings.toString(character.baseStats[0]), '},',
            '{"trait_type":"Damage","value":', Strings.toString(character.baseStats[1]), '},',
            '{"trait_type":"Health","value":', Strings.toString(character.baseStats[2]), '},',
            '{"trait_type":"Harvesting","value":', Strings.toString(character.baseStats[3]), '},',
            '{"trait_type":"Luck","value":', Strings.toString(character.baseStats[4]), '},',
            '{"trait_type":"Armor","value":', Strings.toString(character.baseStats[5]), '}]'
        ));
        
        // Construire le JSON complet des métadonnées
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{"name":"', character.name, '",',
            '"description":"A character for Brotato Web3 game.",',
            '"image":"', _generateImageURI(tokenId), '",',
            '"attributes":', attributes, '}'
        ))));
        
        return string(abi.encodePacked('data:application/json;base64,', json));
    }
    
    /**
     * @dev Génère une URI d'image basique pour un token (placeholder)
     * @param tokenId ID du token
     * @return URI d'image
     */
    function _generateImageURI(uint256 tokenId) private view returns (string memory) {
        // Pour un prototype, on retourne simplement une image placeholder
        // Dans un environnement de production, on utiliserait des images réelles
        return string(abi.encodePacked(
            "data:image/svg+xml;base64,",
            Base64.encode(bytes(_generateSVG(tokenId)))
        ));
    }
    
    /**
     * @dev Génère un SVG basique pour un token
     * @param tokenId ID du token
     * @return SVG du token
     */
    function _generateSVG(uint256 tokenId) private view returns (string memory) {
        Character memory character = characters[tokenId];
        
        // Couleurs selon la rareté
        string[4] memory rarityColors = ["#6E7271", "#32CD32", "#9370DB", "#FFD700"];
        
        // Forme selon le type
        string[6] memory typeShapes = [
            "M50,20 L80,50 L50,80 L20,50 Z", // Guerrier (diamant)
            "M20,50 L50,20 L80,50 L50,80 Z", // Archer (diamant inversé)
            "M50,20 A30,30 0 1,1 50,80 A30,30 0 1,1 50,20 Z", // Mage (cercle)
            "M20,20 L80,20 L80,80 L20,80 Z", // Voleur (carré)
            "M20,35 L80,35 L80,65 L20,65 Z", // Tank (rectangle horizontal)
            "M35,20 L65,20 L65,80 L35,80 Z"  // Support (rectangle vertical)
        ];
        
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">',
            '<rect width="100" height="100" fill="', rarityColors[character.rarity], '" />',
            '<path d="', typeShapes[character.characterType], '" fill="white" />',
            '<text x="50" y="50" font-family="Arial" font-size="10" fill="black" text-anchor="middle">', character.name, '</text>',
            '</svg>'
        ));
    }
}