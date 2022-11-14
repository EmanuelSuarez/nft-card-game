import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHOC, CustomButton, CustomInput, GameLoad } from '../components';
import styles from '../styles';
import { useGlobalContext } from '../context';

const CreateBattle = () => {
  const { contract, battleName, setBattleName, gameData } = useGlobalContext();
  const [ waitBatle, setWaitBatle ] = useState(false);
  const navigate = useNavigate();


  //check if there is a pending battle for the wallet connected
  useEffect(() => {
    if(gameData?.activeBattle?.battleStatus === 0) {
      setWaitBatle(true);
    };
  }, [gameData])

  const handleClick = async () => {
    if(!battleName || !battleName.trim()) return null;

    setWaitBatle(true)

    try {
      await contract.createBattle(battleName);
    } catch (error) {
      console.log(error);
    }
  }
  

  return (
    <>

      {waitBatle && <GameLoad/>}


    <div className='flex flex-col mb-5'>
      <CustomInput
      label="Battle"
      placeholder="Enter Battle Name"
      value={battleName}
      handleValueChange={setBattleName}
      />

      <CustomButton
      title="Create Battle"
      handleClick={handleClick}
      restStyles='mt-6'
      />
    </div>

    <p className={styles.infoText} onClick={() => navigate('/join-battle')} >Or Join already existing batle</p>
    </>
  )
};

export default PageHOC(
    CreateBattle,
  <>Create <br /> a new battle</>,
  <>Create your own battle and wait for other players to join you</>
);