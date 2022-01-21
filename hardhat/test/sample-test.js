const { ethers } = require("hardhat");

describe("NFTMarket", () => {
  it("Should create and execute market sales", async () => {

    const Market = await ethers.getContractFactory("NFTMarket");
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftContractAddress = nft.address;

    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    const price = ethers.utils.parseUnits('10', 'ether');

    await nft.createToken("ifpsurl-1");
    await nft.createToken("ifpsurl-2");

    await market.createMarketElement(nftContractAddress, 1, price, { value: listingPrice })
    await market.createMarketElement(nftContractAddress, 2, price, { value: listingPrice })

    const [_, buyerAddress] = await ethers.getSigners();
    await market.connect(buyerAddress).purchase(nftContractAddress, 1, {
      value: price
    });

    const unsoldElements = await market.listUnsoldElements();
    const createdNFTs = await market.listCreatedNFTs();
    const ownedNFTs = await market.listOwnedNFTs();


    const unsoldTokenURI = await nft.tokenURI(unsoldElements[0].tokenId);
    const details = {
      unsoldTokenURI,
      price: unsoldElements[0].price,
      seller: unsoldElements[0].seller,
      owner: unsoldElements[0].owner
    }
  });

});
