// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Poseidon.sol";
import "./Groth16Verifier.sol";

abstract contract PotionTokenContract {
    function mint(address to, uint256 amount) public virtual;
}

contract FrogCryptoSqueeze is Groth16Verifier, Poseidon, Ownable {
    // The known hash of the FrogCrypto signer
    uint256 constant FROGCRYPTO_SIGNER_HASH =
        14684911797742740124972512003331124235349568037059744667498504691061732129260;

    // Mapping from frogId to squeeze timestamp
    mapping(uint256 => uint256) public squeezeTimestamps;

    bool public enabled = false;

    PotionTokenContract public rarityTokenContract;
    PotionTokenContract public temperamentTokenContract;
    PotionTokenContract public jumpTokenContract;
    PotionTokenContract public speedTokenContract;
    PotionTokenContract public intelligenceTokenContract;
    PotionTokenContract public beautyTokenContract;

    struct ProofArgs {
        uint256[2] _pA;
        uint256[2][2] _pB;
        uint256[2] _pC;
        uint256[60] _pubSignals;
    }

    struct FrogAttributes {
        uint256 beauty;
        uint256 biome;
        uint256 intelligence;
        uint256 jump;
        uint256 speed;
        uint256 rarity;
        uint256 owner;
        uint256 temperament;
        uint256 frogId;
    }

    event Squeeze(
        uint256 indexed frogId,
        address indexed owner,
        uint256 rarityReward,
        uint256 jumpReward,
        uint256 speedReward,
        uint256 intelligenceReward,
        uint256 beautyReward,
        string nameAndStory
    );
    event Enabled(address indexed caller);
    event Disabled(address indexed caller);

    modifier verifiedProof(ProofArgs calldata proof) {
        require(this.verifyProof(proof._pA, proof._pB, proof._pC, proof._pubSignals), "Invalid proof");
        _;
    }

    constructor(
        address rarityTokenAddress,
        address jumpTokenAddress,
        address speedTokenAddress,
        address intelligenceTokenAddress,
        address beautyTokenAddress
    ) {
        rarityTokenContract = PotionTokenContract(rarityTokenAddress);
        jumpTokenContract = PotionTokenContract(jumpTokenAddress);
        speedTokenContract = PotionTokenContract(speedTokenAddress);
        intelligenceTokenContract = PotionTokenContract(intelligenceTokenAddress);
        beautyTokenContract = PotionTokenContract(beautyTokenAddress);
    }

    function squeezeFrog(
        ProofArgs calldata proof,
        FrogAttributes calldata attributes,
        address owner,
        string memory nameAndStory
    ) public {
        require(enabled, "Squeezing is not enabled");

        // First verify the proof and attributes
        require(verifyFrogAttributes(proof, attributes), "Invalid frog attributes");

        require(
            squeezeTimestamps[attributes.frogId] + 1 days < block.timestamp,
            "Squeeze: Cooldown period is not over yet"
        );

        squeezeTimestamps[attributes.frogId] = block.timestamp;

        bytes32 predictableRandom = keccak256(
            abi.encodePacked(attributes.frogId, blockhash(block.number - 1), msg.sender, address(this))
        );

        uint8 temperamentMultiplier = 1;

        // cool temperament gets a bonus (we can add another bonus later)
        if (attributes.temperament == 6) {
            temperamentMultiplier = 2;
        }

        uint256 rarityAmount = ((uint256(uint8(predictableRandom[0])) % 10) + 1) *
            (attributes.rarity + 1) *
            temperamentMultiplier;
        uint256 jumpAmount = ((uint256(uint8(predictableRandom[2])) % 10) + 1) *
            (attributes.jump + 1) *
            temperamentMultiplier;
        uint256 speedAmount = ((uint256(uint8(predictableRandom[3])) % 10) + 1) *
            (attributes.speed + 1) *
            temperamentMultiplier;
        uint256 intelligenceAmount = ((uint256(uint8(predictableRandom[4])) % 10) + 1) *
            (attributes.intelligence + 1) *
            temperamentMultiplier;
        uint256 beautyAmount = ((uint256(uint8(predictableRandom[5])) % 10) + 1) *
            (attributes.beauty + 1) *
            temperamentMultiplier;

        rarityTokenContract.mint(owner, rarityAmount * 1 ether);
        jumpTokenContract.mint(owner, jumpAmount * 1 ether);
        speedTokenContract.mint(owner, speedAmount * 1 ether);
        intelligenceTokenContract.mint(owner, intelligenceAmount * 1 ether);
        beautyTokenContract.mint(owner, beautyAmount * 1 ether);

        emit Squeeze(
            attributes.frogId,
            owner,
            rarityAmount,
            jumpAmount,
            speedAmount,
            intelligenceAmount,
            beautyAmount,
            nameAndStory
        );
    }

    function verifyFrogAttributes(ProofArgs calldata proof, FrogAttributes calldata attrs) public view returns (bool) {
        uint256[60] memory pubSignals = proof._pubSignals;

        // Verify FrogCrypto signer
        require(pubSignals[12] == FROGCRYPTO_SIGNER_HASH, "Invalid signer");

        uint256[1] memory input;

        // Verify beauty
        input[0] = attrs.beauty;
        require(this.hash(input) == pubSignals[0], "Invalid beauty value");

        // Verify biome
        input[0] = attrs.biome;
        require(this.hash(input) == pubSignals[1], "Invalid biome value");

        // verify frogId
        input[0] = attrs.frogId;
        require(this.hash(input) == pubSignals[3], "Invalid frogId value");

        // Verify intelligence
        input[0] = attrs.intelligence;
        require(this.hash(input) == pubSignals[4], "Invalid intelligence value");

        // Verify jump
        input[0] = attrs.jump;
        require(this.hash(input) == pubSignals[5], "Invalid jump value");

        // Verify owner
        input[0] = attrs.owner;
        require(this.hash(input) == pubSignals[7], "Invalid owner value");

        // Verify rarity
        input[0] = attrs.rarity;
        require(this.hash(input) == pubSignals[8], "Invalid rarity value");

        // Verify speed
        input[0] = attrs.speed;
        require(this.hash(input) == pubSignals[9], "Invalid speed value");

        input[0] = attrs.temperament;
        require(this.hash(input) == pubSignals[10], "Invalid speed value");

        return true;
    }

    function enable() external onlyOwner {
        enabled = true;

        emit Enabled(msg.sender);
    }

    function disable() external onlyOwner {
        enabled = false;

        emit Disabled(msg.sender);
    }
}
