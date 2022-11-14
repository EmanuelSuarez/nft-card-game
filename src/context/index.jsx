import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { useNavigate } from "react-router-dom"; 

import { ABI, ADDRESS } from '../contract'
import { createEventListeners } from "./createEventListeners";

const GlobalContext = createContext();

export const GlobalContextProvider = ( {children} ) => {

    const [walletAddress, setWalletAddress] = useState('')
    const [provider, setProvider] = useState('')
    const [contract, setContract] = useState('')
    const [ showAlert, setShowAlert ] = useState({status: false, type:'info', message:''});
    const [ battleName, setBattleName ] = useState('');
    const [ gameData, setGameData ] = useState({ players: [], pendingBattles: [], activeBattle: null });
    const [ updateGameData, setUpdateGameData ] = useState(0); 

    const navigate = useNavigate();

    // set the wallet address to the state
    const updateCurrrentWalletAddress = async () => {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'

            
        });
        if(accounts) setWalletAddress(accounts[0]);
    }

    useEffect(() => {
        updateCurrrentWalletAddress();

        window.ethereum.on('accountsChanged', updateCurrrentWalletAddress);
    },[])


    // set the smart contract and the provider to the state
    useEffect(() => {
        const setSmartContractAndProvider = async () => {
            const web3modal = new Web3Modal();
            const connection = await web3modal.connect();
            const newProvider = new ethers.providers.Web3Provider(connection);
            const signer = newProvider.getSigner();
            const newContract = new ethers.Contract(ADDRESS, ABI, signer);

            setProvider(newProvider);
            setContract(newContract);
        };

        setTimeout(() =>setSmartContractAndProvider(), 1000)

    },[])

    useEffect(() => {
        if(contract) {
            createEventListeners({
                navigate, contract, provider, walletAddress, setShowAlert, setUpdateGameData,
            });
        }
    }, [contract])


    useEffect(() => {
        if (showAlert?.status) {
            const timer = setTimeout(() => {
                setShowAlert({status: false, type:'info', message:''})
            }, [5000])

            return () => clearTimeout(timer);
        }
    },[showAlert])

    // set the game data to the state
    useEffect(() => {
        const fetchGameData = async () => {
            const fetchedBattles = await contract.getAllBattles();
            const pendingBattles = fetchedBattles.filter((battle) => battle.battleStatus === 0);
            let activeBattle = null;

            fetchedBattles.forEach((battle) => {
                if(battle.players.find((player) => player.toLowerCase() === walletAddress.toLowerCase())) {
                    activeBattle = battle;
                }
            })

            setGameData({ pendingBattles: pendingBattles.slice(1), activeBattle });
        };

        if(contract) fetchGameData();
    }, [contract, updateGameData])

    return (
        <GlobalContext.Provider value={{
            contract, walletAddress, showAlert, setShowAlert, battleName, setBattleName, gameData,
        }}>
        {children}
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = () => useContext(GlobalContext);