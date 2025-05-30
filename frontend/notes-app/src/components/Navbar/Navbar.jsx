import React, { useState } from 'react'
import ProfileInfo from '../Cards/ProfileInfo'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../SearchBar/SearchBar';
import { FaUser } from "react-icons/fa";

const Navbar = ({userInfo,onSearchNote,handleClearSearch}) => {
  const [searchQuery,setSearchQuery] =useState("");


  const Navigate=useNavigate();
  const onLogout=()=>{
    localStorage.clear()
    Navigate("/login");
  }



const handleSearch=()=>{
  if(searchQuery){
    onSearchNote(searchQuery)
  }
}

const onClearSearch=()=>{
  setSearchQuery("")
  handleClearSearch()
}

  return (
    <div className='bg-white flex items-center justify-between px-6 py-2 drop-shadow'>
      <h2 className='text-xl font-medium text-black py-2'>Notes</h2>
      <SearchBar 
          value={searchQuery} 
          onChange={({target})=>{
          setSearchQuery(target.value);
      }}
      handleSearch={handleSearch}
      onClearSearch={onClearSearch}
      onKeyDown={(e)=>{
        if(e.key==="Enter"){
          handleSearch()
        }
      }}
      />
        {userInfo ? (
    <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
  ) : (
    <FaUser 
      className="text-2xl text-gray-600 cursor-pointer hover:text-black" 
      onClick={() => Navigate("/login")}
    />
  )}
    </div>
  )
}

export default Navbar
