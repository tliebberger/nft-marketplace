import { ethers } from 'ethers'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import { nftAddress, nftMarketAddress } from '../config'
import NFT from '../hardhat/artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../hardhat/artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function MyStuff() {
  const [myStuff, setMyStuff] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMyStuff()
  }, [])

  const loadMyStuff = async () => {
    setLoading(true)
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, signer)

    const myStuff = await marketContract.listOwnedNFTs()

    const elements = await Promise.all(myStuff.map(async (e) => {
      const tokenURI = await tokenContract.tokenURI(e.tokenId)
      const metaData = await axios.get(tokenURI)
      let price = ethers.utils.formatUnits(e.price.toString(), 'ether')
      return {
        price,
        tokenId: e.tokenId.toNumber(),
        seller: e.seller,
        owner: e.owner,
        image: metaData.data.image
      }
    }))

    setMyStuff(elements)
    setLoading(false)
  }

  if (!loading && !myStuff.length) return (
    <h1 className='py-10 px-20 text-3xl'>Stop being poor and buy some stuff</h1>
  )

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {myStuff.map((nft, index) => (
            <div key={index} className="border shadow rounded-xl overflow-hidden">
              <Image src={nft.image} alt="image" width={500} height={500} />
              <div className='p-4'>
                <p style={{ height: '64px' }} className='text-2xl font-semibold'>{nft.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div >
  )


}