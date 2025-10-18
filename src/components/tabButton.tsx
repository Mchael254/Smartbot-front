import type { ButtonTabProps } from "../types/buttons"

function TabButton({prop, onClick}:ButtonTabProps){
    return(
         <button className="rounded-lg py-2 px-2 cursor-pointer text-white"style={{backgroundColor:"#00963f"}} onClick={onClick}  >
            {prop}
        </button>

    )
}

export default TabButton