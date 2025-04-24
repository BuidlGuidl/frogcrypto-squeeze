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

        // First verify the constants
        require(verifyPubSignalKnownConstants(proof), "Invalid known constants");

        // Then verify the attributes
        require(verifyFrogAttributes(proof, attributes), "Invalid frog attributes");

        // And finally verify the proof
        require(this.verifyProof(proof._pA, proof._pB, proof._pC, proof._pubSignals), "Invalid proof");

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

    function verifyPubSignalKnownConstants(ProofArgs calldata proof) public pure returns (bool) {
        uint256[60] memory pubSignals = proof._pubSignals;

        require(
            pubSignals[11] == 21888242871839275222246405745257275088548364400416034343698204186575808495616,
            "Invalid known constant 11"
        );

        // Verify FrogCrypto signer
        require(pubSignals[12] == FROGCRYPTO_SIGNER_HASH, "Invalid signer");

        // Fixed values for indices 13 to 59
        uint256[47] memory fixedValues = [
            21888242871839275222246405745257275088548364400416034343698204186575808495616,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            320469162396708332516033932244029190181315114284264408621970394677041964715,
            79811696653591665733987051350844413541610759479683385956516607740051690419,
            355166872430925829725279673336652965404834009932046877642532049371080064209,
            131784857445920278807149809616705815466379358159709139801848746703275797463,
            281816578944984323586893082955502346500813215897786536562124638649161032021,
            190563830761898862018106264927787031412916351705218672411626223525427995849,
            230817354225034729219104242291752751725751467730056472112085822421181653966,
            134391921332508560099964544679493715295561887371159641958333364222734962117,
            353266386363935664439509954355717614533254106148005157507977650263408718488,
            331813365179563087827748601718945520853733728907634595064819635670819214786,
            220503421335407425308639442017232224940359242843979015945964974707193355771,
            2047,
            2,
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            8191,
            21888242871839275222246405745257275088548364400416034343698204186575808495616,
            21888242871839275222246405745257275088548364400416034343698204186575808495616,
            0,
            0,
            0,
            0,
            0,
            21888242871839275222246405745257275088548364400416034343698204186575808495616
        ];

        for (uint256 i = 13; i <= 59; i++) {
            require(
                pubSignals[i] == fixedValues[i - 13],
                string(abi.encodePacked("Invalid known constant at index ", i))
            );
        }

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
