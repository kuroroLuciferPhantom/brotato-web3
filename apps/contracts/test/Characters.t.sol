// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Characters} from "../src/Characters.sol";

contract CharactersTest is Test {
    Characters public characters;
    address public owner;
    address public user1;
    address public user2;
    address public treasury;
    
    event CharacterMinted(address indexed owner, uint256 indexed tokenId, uint8 characterType, uint8 rarity);
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        treasury = makeAddr("treasury");
        
        // Donner des ETH aux utilisateurs pour les tests
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        
        // Déployer le contrat Characters
        characters = new Characters("Test Characters", "TESTCHAR", treasury, "");
    }
    
    function testOwnerMint() public {
        // Mint un personnage en tant que propriétaire
        uint256 tokenId = characters.ownerMint(user1, 0, 1); // Guerrier rare
        
        // Vérifier le propriétaire du token
        assertEq(characters.ownerOf(tokenId), user1);
        
        // Vérifier les attributs du personnage
        (string memory name, uint8 characterType, uint8 rarity, , ) = characters.characters(tokenId);
        assertEq(characterType, 0);
        assertEq(rarity, 1);
    }
    
    function testPublicMint() public {
        uint256 mintPrice = characters.mintPrice();
        
        // Tester le mint en payant trop peu
        vm.prank(user1);
        vm.expectRevert("Insufficient payment");
        characters.mintCharacter{value: mintPrice - 1}(user1, 0);
        
        // Tester le mint avec un type de personnage invalide
        vm.prank(user1);
        vm.expectRevert("Invalid character type");
        characters.mintCharacter{value: mintPrice}(user1, 10);
        
        // Mint valide
        vm.prank(user1);
        uint256 tokenId = characters.mintCharacter{value: mintPrice}(user1, 1);
        
        // Vérifier le propriétaire du token
        assertEq(characters.ownerOf(tokenId), user1);
        
        // Vérifier les attributs du personnage
        (string memory name, uint8 characterType, , , ) = characters.characters(tokenId);
        assertEq(characterType, 1);
        
        // Vérifier que l'ETH a été envoyé au trésor
        assertEq(address(treasury).balance, mintPrice);
    }
    
    function testMintEvent() public {
        // Vérifier que l'événement est émis
        vm.expectEmit(true, true, false, true);
        emit CharacterMinted(user1, 1, 2, 3);
        
        // Mint qui devrait émettre l'événement
        characters.ownerMint(user1, 2, 3);
    }
    
    function testRarityCheck() public {
        // Mint des personnages de différentes raretés
        uint256 commonTokenId = characters.ownerMint(user1, 0, 0);
        uint256 rareTokenId = characters.ownerMint(user1, 0, 1);
        uint256 epicTokenId = characters.ownerMint(user1, 0, 2);
        uint256 legendaryTokenId = characters.ownerMint(user1, 0, 3);
        
        // Vérifier les raretés
        assertTrue(characters.isCharacterOfRarity(commonTokenId, 0));
        assertTrue(characters.isCharacterOfRarity(rareTokenId, 1));
        assertTrue(characters.isCharacterOfRarity(epicTokenId, 2));
        assertTrue(characters.isCharacterOfRarity(legendaryTokenId, 3));
        
        // Vérifier qu'un personnage n'est pas d'une autre rareté
        assertFalse(characters.isCharacterOfRarity(commonTokenId, 1));
        assertFalse(characters.isCharacterOfRarity(legendaryTokenId, 0));
    }
    
    function testGetCharacterStats() public {
        // Mint un personnage
        uint256 tokenId = characters.ownerMint(user1, 0, 0);
        
        // Obtenir les statistiques
        uint8[6] memory stats = characters.getCharacterStats(tokenId);
        
        // Vérifier que les statistiques sont dans des plages raisonnables
        for (uint8 i = 0; i < 6; i++) {
            assertTrue(stats[i] > 0, "Stat should be positive");
            assertTrue(stats[i] < 100, "Stat should be reasonable");
        }
    }
    
    function testTokenURI() public {
        // Mint un personnage
        uint256 tokenId = characters.ownerMint(user1, 0, 0);
        
        // Obtenir l'URI du token (métadonnées on-chain pour notre test)
        string memory uri = characters.tokenURI(tokenId);
        
        // Vérifier que l'URI commence par data:application/json;base64
        assertEq(substring(uri, 0, 29), "data:application/json;base64,");
    }
    
    function testSetMintPrice() public {
        uint256 newPrice = 0.05 ether;
        
        // Tester que seul le propriétaire peut changer le prix
        vm.prank(user1);
        vm.expectRevert();
        characters.setMintPrice(newPrice);
        
        // Changer le prix en tant que propriétaire
        characters.setMintPrice(newPrice);
        
        // Vérifier que le prix a changé
        assertEq(characters.mintPrice(), newPrice);
    }
    
    function testSetTreasury() public {
        address newTreasury = address(0x123);
        
        // Tester que seul le propriétaire peut changer le trésor
        vm.prank(user1);
        vm.expectRevert();
        characters.setTreasury(newTreasury);
        
        // Changer le trésor en tant que propriétaire
        characters.setTreasury(newTreasury);
        
        // Vérifier que le trésor a changé
        assertEq(characters.treasury(), newTreasury);
    }
    
    // Fonction utilitaire pour obtenir une sous-chaîne de caractères
    function substring(string memory str, uint startIndex, uint length) private pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        require(startIndex + length <= strBytes.length, "Index out of bounds");
        
        bytes memory result = new bytes(length);
        for (uint i = 0; i < length; i++) {
            result[i] = strBytes[startIndex + i];
        }
        
        return string(result);
    }
}