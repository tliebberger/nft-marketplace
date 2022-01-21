// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice = 0.025 ether;

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketElement {
        uint256 itemId;
        address tokenAddress;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketElement) private idToMarketElement;

    event MarketElementCreated(
        uint256 indexed itemId,
        address indexed tokenAddress,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function createMarketElement(
        address tokenAddress,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 (g)wei");
        require(
            msg.value == listingPrice,
            "Fee must be equal to listing price"
        );
        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketElement[itemId] = MarketElement(
            itemId,
            tokenAddress,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        // transfer the ownership to the marketplace to make it possible to transfer it to the next owner
        IERC721(tokenAddress).transferFrom(msg.sender, address(this), tokenId);

        emit MarketElementCreated(
            itemId,
            tokenAddress,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    function purchase(address tokenAddress, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 price = idToMarketElement[itemId].price;
        uint256 tokenId = idToMarketElement[itemId].tokenId;
        require(
            msg.value == price,
            "Please submit the asking price for this item"
        );
        // transfer value to owner address
        idToMarketElement[itemId].seller.transfer(msg.value);

        // transfer the ownership of the token to the function caller
        IERC721(tokenAddress).transferFrom(address(this), msg.sender, tokenId);

        // update MarketElement
        idToMarketElement[itemId].owner = payable(msg.sender);
        idToMarketElement[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(listingPrice);
    }

    function listUnsoldElements() public view returns (MarketElement[] memory) {
        uint256 totalCount = _itemIds.current();
        uint256 unsoldItemCount = totalCount - _itemsSold.current();

        uint256 foundIndex = 0;

        MarketElement[] memory elements = new MarketElement[](unsoldItemCount);

        for (uint256 i = 0; i < totalCount; i++) {
            uint256 curr = i + 1;
            // element is unsold
            if (idToMarketElement[curr].owner == address(0)) {
                uint256 foundId = idToMarketElement[curr].itemId;
                MarketElement memory foundElement = idToMarketElement[foundId];
                elements[foundIndex] = foundElement;
                foundIndex += 1;
            }
        }

        return elements;
    }

    function listCreatedNFTs() public view returns (MarketElement[] memory) {
        uint256 totalCount = _itemIds.current();
        uint256 count = 0;
        uint256 foundIndex = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            uint256 curr = i + 1;
            // element is unsold
            if (idToMarketElement[curr].seller == msg.sender) {
                count += 1;
            }
        }

        MarketElement[] memory ownedElements = new MarketElement[](count);

        for (uint256 i = 0; i < totalCount; i++) {
            uint256 curr = i + 1;
            // element is unsold
            if (idToMarketElement[curr].seller == msg.sender) {
                uint256 foundId = idToMarketElement[curr].itemId;
                MarketElement memory foundElement = idToMarketElement[foundId];
                ownedElements[foundIndex] = foundElement;
                foundIndex += 1;
            }
        }

        return ownedElements;
    }

    function listOwnedNFTs() public view returns (MarketElement[] memory) {
        uint256 totalCount = _itemIds.current();
        uint256 count = 0;
        uint256 foundIndex = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            uint256 curr = i + 1;
            // element is unsold
            if (idToMarketElement[curr].owner == msg.sender) {
                count += 1;
            }
        }

        MarketElement[] memory ownedElements = new MarketElement[](count);

        for (uint256 i = 0; i < totalCount; i++) {
            uint256 curr = i + 1;
            // element is unsold
            if (idToMarketElement[curr].owner == msg.sender) {
                uint256 foundId = idToMarketElement[curr].itemId;
                MarketElement memory foundElement = idToMarketElement[foundId];
                ownedElements[foundIndex] = foundElement;
                foundIndex += 1;
            }
        }

        return ownedElements;
    }
}
