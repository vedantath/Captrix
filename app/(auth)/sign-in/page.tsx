'use client';
import Link from 'next/link'
import React from 'react'
import Image from "next/image"
import { authClient } from '@/lib/auth-client';

const page = () => {
  const handleSignIn = async () => {
    return await authClient.signIn.social({ provider: 'google' });
  }

  return (
    <main className='sign-in'>
      <aside className='testimonial'>
        <Link href="/">
          <Image src="/assets/icons/logo.svg" alt="logo" width={32} height={32} />
          <h1>Captrix</h1>
        </Link>

        <div className='description'>
          <section>
            <figure>
              {Array.from({ length: 5}).map((_, index) => (
                <Image src="/assets/icons/star.svg" alt="star" width={20} height={20} key={index} />
              ))}
            </figure>
            <p>Captrix simplifies screen recording. Whether you’re doing a brief walkthrough or a detailed presentation, 
              it’s quick, seamless, and lets you share your videos instantly.</p>
            <article>
              <Image src="/assets/images/vedant.jpg" alt="jason" width={64} height={64} className='rounded-full'/>
              <div>
                <h2>Vedant Athale</h2>
                {/* <p>Title, Captrix</p> */}
              </div>
            </article>
          </section>
        </div>
        <p>© Captrix {(new Date()).getFullYear()}</p>
      </aside>

      <aside className='google-sign-in'>
        <section>
          <Link href="/">
              <Image src="/assets/icons/logo.svg" alt="logo" width={40} height={40} />
              <h1>Captrix</h1>
          </Link>
          <p>Create and share your very first <span>Captrix video</span> in no time!</p>
          <button onClick={handleSignIn}>
            <Image src="/assets/icons/google.svg" alt="google" width={22} height={22} />
            <span>Sign in with Google</span>
          </button>
        </section>
      </aside>
      <div className='overlay'/>
    </main>
  )
}

export default page