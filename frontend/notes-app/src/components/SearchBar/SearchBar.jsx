import {FaMagnifyingGlass} from "react-icons/fa6"
import {IoMdClose} from "react-icons/io"
const SearchBar = ({value,onChange,handleSearch,onClearSearch}) => {
  const handleKeyDown=(e)=>{
    if(e.key==="Enter"){
      handleSearch()
    }
  }
  return (
    <div className="w-80 flex items-center px-4 bg-slate-100 rounded-md">
      <input type="text" 
      placeholder="Serach Notes"
       className="w-full text-sc bg-transparent py-[11px] outline-none"
       value={value}
       onChange={onChange}
       onKeyDown={handleKeyDown}
       />

       {value && (
        <IoMdClose className="text-xl text-slate-500 cursor-pointer hover:text-black mr-3"  onClick={onClearSearch}/>
        )}
       <FaMagnifyingGlass className="text-slate-400 cursor-pointer hover:text-black" onClick={handleSearch}/>
    </div>
  )
}

export default SearchBar
