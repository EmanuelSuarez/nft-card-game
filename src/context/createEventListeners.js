import { ethers } from "ethers";
import { ABI } from "../contract";

const AddNewEvent = (eventFilter, provider, cb) => {
    provider.removeListener(eventFilter);

    provider.on(eventFilter, (logs) => {
        const parsedLog = (new ethers.utils.Interface(ABI)).parseLog(logs);

        cb(parsedLog);
    })
}

export const createEventListeners = ({ navigate, contract, provider, walletAddress, setShowAlert, setUpdateGameData }) => {
    const NewPlayerEventFilter = contract.filters.NewPlayer();

    AddNewEvent(NewPlayerEventFilter, provider, ({ args }) => {
        console.log(`New player Created ${args}`);

        if(walletAddress === args.owner) {
            setShowAlert({
                status: true,
                type: 'success',
                message: 'player has been succesfully registered!'
            })
        }
    })

    const newBattleEventFilter = contract.filters.NewBattle();

    AddNewEvent(newBattleEventFilter, provider, ({ args }) => {
       console.log('New battle started!', args, walletAddress);
       
       if(walletAddress.toLowerCase() === args.player1.toLowerCase() || walletAddress.toLowerCase() === args.player2.toLowerCase()) {
        navigate(`/battle/${args.battleName}`)
       }

       setUpdateGameData((prevUpdateGameData) => prevUpdateGameData + 1);

    });

}