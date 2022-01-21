import '../styles/globals.css'
import Link from 'next/link';

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className='text-4xl font-bold'>Market</p>
        <div className='flex mt-4'>
          <Link href="/">
            <a className='mr-6 text-blue-400'>Home</a>
          </Link>
          <Link href="/create">
            <a className='mr-6 text-blue-400'>Create Stuff</a>
          </Link>
          <Link href="/sell">
            <a className='mr-6 text-blue-400'>Sell stuff</a>
          </Link>
          <Link href="/show">
            <a className='mr-6 text-blue-400'>Show my stuff</a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp


