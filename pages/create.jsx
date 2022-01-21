import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

import { nftAddress, nftMarketAddress } from '../config'
import NFT from '../hardhat/artifacts/contracts/NFT.sol/NFT.json'
import NFTMarket from '../hardhat/artifacts/contracts/NFTMarket.sol/NFTMarket.json'

const BASE_URL = 'https://ipfs.infura.io/ipfs'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState("")
  const [formInput, setFormInuput] = useState({ price: '', name: '', description: '' })

  const router = useRouter()

  const uploadFile = async (e) => {
    const file = e.target.files[0]
    try {
      const added = await client.add(file, { progress: (p) => console.log('prog') })
      setFileUrl(`${BASE_URL}/${added.path}`)
    } catch (err) {
      console.log(err)
    }
  }

  const createItem = async () => {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return
    const data = JSON.stringify({ name, description, image: fileUrl })
    try {
      const added = await client.add(data);
      const url = `${BASE_URL}/${added.path}`
      await createSale(url)

    } catch (err) {
      console.error(err)
    }
  }

  const createSale = async (url) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    let contract = new ethers.Contract(nftAddress, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    const tx = await transaction.wait()

    let event = tx.events[0]
    let value = event.args[2]
    const tokenId = value.toNumber()
    const price = ethers.utils.parseUnits(formInput.price, "ether")

    contract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    transaction = await contract.createMarketElement(nftAddress, tokenId, price, { value: listingPrice })
    await transaction.wait()
    router.push('/')
  }

  return (
    <div className='flex justify-center'>
      <div className='w-1/2 flex flex-col pb-12' >
        <input
          type="text"
          placeholder='Name'
          className='mt-8 border rounded p-4'
          onChange={e => setFormInuput({ ...formInput, name: e.target.value })}
        />
        <input
          type="text"
          placeholder='Descritpion'
          className='mt-8 border rounded p-4'
          onChange={e => setFormInuput({ ...formInput, description: e.target.value })}
        />
        <input
          type="text"
          placeholder='Price'
          className='mt-8 border rounded p-4'
          onChange={e => setFormInuput({ ...formInput, price: e.target.value })}
        />
        <input
          type="file"
          name="Super crazy NFT"
          className='my-4'
          onChange={uploadFile}
        />
        <button
          className='font-bold mt-4 bg-red-300 text-white rounded p-4 shadow-lg'
          onClick={createItem}
        >
          Create your NFT
        </button>
      </div>
    </div>
  )
}
