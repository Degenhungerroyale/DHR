import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Wallet } from 'lucide-react';

function useWallet() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [hasPhantom, setHasPhantom] = useState(false);

  useEffect(() => {
    setHasPhantom(typeof window !== 'undefined' && !!window.solana && window.solana.isPhantom);
  }, []);

  const connect = async () => {
    if (hasPhantom) {
      const resp = await window.solana.connect();
      setConnected(true);
      setAddress(resp.publicKey.toString());
    } else {
      setConnected(true);
      setAddress('DEGEN...WALLET');
    }
  };
  const disconnect = async () => { setConnected(false); setAddress(null); };

  return { connected, address, hasPhantom, connect, disconnect };
}

const GRID = 20;
const CONTRACT_ADDRESS = "(add later)";
const defaultNames = ["Alpha","Bravo","Charlie","Delta","Echo","Foxtrot","Golf","Hotel"];

function mulberry32(seed){ return function(){ let t=(seed+=0x6D2B79F5); t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return((t^(t>>>14))>>>0)/4294967296; }; }
function pickItem(r, arr){ return arr[Math.floor(r()*arr.length)]; }

function initNPCs(seed=777){
  const r=mulberry32(seed);
  return Array.from({length:10},(_,i)=>({
    id:i,
    name:`${pickItem(r,defaultNames)}-${i+1}`,
    alive:true,
    x:Math.floor(r()*GRID),
    y:Math.floor(r()*GRID)
  }));
}

export default function App(){
  const [npcs,setNPCs]=useState(()=>initNPCs());
  const wallet = useWallet();

  useEffect(()=>{
    const id=setInterval(()=>{
      setNPCs(prev=>prev.map(n=>({...n, x:Math.max(0,Math.min(GRID-1,n.x+(Math.random()*2-1))), y:Math.max(0,Math.min(GRID-1,n.y+(Math.random()*2-1)))})));
    },500);
    return()=>clearInterval(id);
  },[]);

  return (
    <div className='p-4'>
      <header className='flex justify-between mb-2'>
        <div className='flex items-center gap-2'><Swords/><h1 className='font-bold'>Degen Hunger Royale</h1></div>
        <div>
          <button onClick={()=>wallet.connected?wallet.disconnect():wallet.connect()} className='bg-gray-200 px-3 py-1 rounded'>
            <Wallet className='inline-block'/> {wallet.connected?(wallet.address.slice(0,4)+'…'+wallet.address.slice(-4)):(wallet.hasPhantom?'Connect Phantom':'Connect Wallet')}
          </button>
        </div>
      </header>
      <div className='text-xs mb-2'>Contract: <code>{CONTRACT_ADDRESS}</code></div>
      <div className='relative h-96 border'>
        {npcs.map(n=>(<motion.div key={n.id} className='absolute bg-red-500 rounded-full w-6 h-6' style={{left:`${(n.x/GRID)*100}%`,top:`${(n.y/GRID)*100}%`,transform:'translate(-50%,-50%)'}} animate={{left:`${(n.x/GRID)*100}%`,top:`${(n.y/GRID)*100}%`}}/>))}
      </div>
    </div>
  );
}
