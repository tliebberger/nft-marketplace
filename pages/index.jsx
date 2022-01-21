import Image from 'next/image'
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import axios from 'axios'
import Web3Modal from "web3modal"

import { nftAddress, nftMarketAddress } from "../config"

import NFT from '../hardhat/artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../hardhat/artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function Home() {

  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => loadNFTs(), [])

  const loadNFTs = async () => {
    setLoading(true)
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, provider)
    const unsoldItems = await marketContract.listUnsoldElements()

    const elements = await Promise.all(unsoldItems.map(async (e) => {
      const tokenURI = await tokenContract.tokenURI(e.tokenId)
      const metaData = await axios.get(tokenURI)
      let price = ethers.utils.formatUnits(e.price.toString(), 'ether')
      return {
        price,
        tokenId: e.tokenId.toNumber(),
        seller: e.seller,
        owner: e.owner,
        image: metaData.data.image,
        name: metaData.data.name,
        description: metaData.data.description
      }
    }))

    setNfts(elements)
    setLoading(false)
  }

  const purchaseNft = async (nft) => {
    console.log(nft)
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, signer)
    const price = ethers.utils.parseUnits(nft.price, 'ether')

    const transaction = await contract.purchase(nftAddress, nft.tokenId, {
      value: price
    })
    await transaction.wait()

    await loadNFTs()
  }

  if (!loading && !nfts.length) {
    return (
      <div className="px-20 py-10 text-3xl">No items to show - how about you create the first one</div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, index) => (
            <div key={index} className="border shadow rounded-xl overflow-hidden">
              <Image src={nft.image} alt="image" width={500} height={500} />
              <div className='p-4'>
                <p style={{ height: '64px' }} className='text-2xl font-semibold'>{nft.name}</p>
                <div style={{ height: '70px', overflow: 'hidden' }}>
                  <p className='text-gray-400'>{nft.description}</p>
                </div>
              </div>
              <div className='p-4 bg-black'>
                <p className='text-2xl mb-4 font-bold text-white'>Matic</p>
                <button
                  className='w-full bg-blue-600 text-white font-bold py-2 px-12 rounded'
                  onClick={() => purchaseNft(nft)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div >
  )
}
