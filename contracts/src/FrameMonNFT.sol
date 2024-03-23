// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "openzeppelin-contracts/contracts/access/AccessControl.sol";

struct FrameMon {
    uint256 tokenId;
    address owner;
    string name;
    uint48 birthDate;
    uint48 moodUpdate;
    uint48 energyUpdate;
    uint48 socialUpdate;
    uint8 mood;
    uint8 energy;
    uint8 social;
}

contract FrameMonNFT is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 tokenIds = 0;
    mapping(uint256 => FrameMon) public frameMons;
    mapping(address => uint256) public ownerToTokenId;

    constructor() ERC721("FRAMEMON", "FMON") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(string memory _name) external returns (uint256) {
        tokenIds++;
        ownerToTokenId[msg.sender] = tokenIds;

        FrameMon memory frameMon = FrameMon({
            tokenId: tokenIds,
            owner: msg.sender,
            name: _name,
            birthDate: uint48(block.timestamp),
            moodUpdate: uint48(block.timestamp),
            energyUpdate: uint48(block.timestamp),
            socialUpdate: uint48(block.timestamp),
            mood: 50,
            energy: 50,
            social: 50
        });

        frameMons[tokenIds] = frameMon;

        _mint(msg.sender, tokenIds);
        return tokenIds;
    }

    function cheer() external {
        FrameMon storage frameMon = frameMons[ownerToTokenId[msg.sender]];
        require(frameMon.owner == msg.sender, "FrameMonNFT: not owner");
        require(
            block.timestamp - uint256(frameMon.moodUpdate) > 3600,
            "FrameMonNFT: not enough time passed"
        );
        uint8 newMood = _calculateTimeAdjustedStat(
            frameMon.mood,
            frameMon.moodUpdate
        );
        frameMon.mood = newMood > 90 ? 100 : newMood + 10;
        frameMon.moodUpdate = uint48(block.timestamp);
    }

    function feed() external {
        FrameMon storage frameMon = frameMons[ownerToTokenId[msg.sender]];
        require(
            frameMon.owner == msg.sender,
            "FrameMonNFT: not owner or doesnt exist."
        );
        require(
            block.timestamp - uint256(frameMon.energyUpdate) > 3600,
            "FrameMonNFT: not enough time passed"
        );
        uint8 newEnergy = _calculateTimeAdjustedStat(
            frameMon.energy,
            frameMon.energyUpdate
        );
        frameMon.energy = newEnergy > 90 ? 100 : newEnergy + 10;
        frameMon.energyUpdate = uint48(block.timestamp);
    }

    function socialize(address _friend) external {
        FrameMon storage frameMon = frameMons[ownerToTokenId[_friend]];
        require(frameMon.owner == _friend, "FrameMonNFT: Doesnt exist.");
        require(
            block.timestamp - uint256(frameMon.socialUpdate) > 3600,
            "FrameMonNFT: not enough time passed"
        );
        uint8 newSocial = _calculateTimeAdjustedStat(
            frameMon.social,
            frameMon.socialUpdate
        );
        frameMon.social = newSocial > 90 ? 100 : newSocial + 10;
        frameMon.socialUpdate = uint48(block.timestamp);
    }

    function _calculateTimeAdjustedStat(
        uint8 stat,
        uint48 lastUpdate
    ) internal view returns (uint8) {
        uint256 timePassed = block.timestamp - lastUpdate;
        uint256 statChange = timePassed / 3600;

        if (statChange > 0) {
            if (statChange >= stat) {
                return 0;
            } else {
                return stat - uint8(statChange);
            }
        }
        return stat;
    }

    function getMon(
        address _owner
    )
        external
        view
        returns (
            FrameMon memory frameMon,
            uint8 mood,
            uint8 energy,
            uint8 social
        )
    {
        frameMon = frameMons[ownerToTokenId[_owner]];
        mood = _calculateTimeAdjustedStat(frameMon.mood, frameMon.moodUpdate);
        energy = _calculateTimeAdjustedStat(
            frameMon.energy,
            frameMon.energyUpdate
        );
        social = _calculateTimeAdjustedStat(
            frameMon.social,
            frameMon.socialUpdate
        );
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        ownerToTokenId[to] = tokenId;
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
