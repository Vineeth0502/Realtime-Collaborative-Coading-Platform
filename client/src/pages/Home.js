import React, { useState } from 'react'
import {v4 as uuidV4} from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const [roomId,setRoomId] = useState('');
  const [username,setUsername] = useState('');
  const createNewRoom = (e) => {
    e.preventDefault();
    const id=uuidV4();
    setRoomId(id);
    toast.success('Created a new room');
  };

  const joinRoom = () => {
    if(!roomId || !username){
      toast.error('ROOM ID & username is required');
      return;
    }

    //Redirect
    navigate(`/editor/${roomId}`,{
      state: {
        username,
      }
    })
  };

  const handleInputEnter=(e)=>{
     if(e.code==='Enter'){
        joinRoom();
     }
  };

  return(
   <div className="homePageWrapper" style={{backgroundColor: "#070f2b"}}>
    <h2 className= "rubik-glitch" style={{position:"absolute",top:"0px",left:"360px", fontSize: "36px"}}>CN PROJECT</h2>
    <img className='logo_contain' src='/work-together.jpg' style={{width: "850px"}}></img>
    <div className="formWrapper" style={{backgroundColor: "#1b1a55",height: "510px"}}>
        <img className="homePageLogo" src="/logo-icon.png" style={{marginTop: "90px"}}></img>
        <img className="homePageLogo" src="/codetogether.png"></img>
        <h4 className="mainLabel">Paste invitaiton ROOM ID</h4>
        <div className="inputGroup">
          <input 
          type="text"
           className="inputBox" 
           placeholder="ROOM ID"
           onChange={(e)=>setRoomId(e.target.value)}
           value={roomId}
           onKeyUp={handleInputEnter}
          />
           <input 
          type="text"
           className="inputBox" 
           placeholder="USER NAME"
           onChange={(e)=>setUsername(e.target.value)}
           value={username}
           onKeyUp={handleInputEnter}
          />
          <buton className="btn joinBtn" onClick={joinRoom} style={{  width: "215px", marginLeft: "90px"}}>Join</buton>
          <span className="createInfo">
            If you don't have an invite then create &nbsp;
            <a onClick={createNewRoom} href="" className="createNewBtn">
              new room
            </a>
          </span>
        </div>
    </div>
  </div>
  );
};

export default Home;