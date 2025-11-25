import StreakIcon from "../assets/icons/stop-circle-outline.svg?react"
import MoreIcon from "../assets/icons/more-vertical-outline.svg?react"
import StreakOnIcon from "../assets/icons/streak-on-indicator.png"
import StreakOffIcon from "../assets/icons/streak-off-indicator.png"

function TrackerCard(){

    const BankName = "LandBank"
    const Balance = "113,253.67"
    const Streak = "67"
    const Progress = "70"
    const StreakActive = true

    return(
        <>  
            <div className="pl-2 snap-start">
                <div className="relative flex flex-col justify-between min-w-80 min-h-50 max-w-80 max-h-50 w-80 h-50 bg-[var(--neutral0)] rounded-4xl shadow-lg p-5">
                    
                    <button 
                        className="absolute top-5 right-5 !w-9 !h-9 !rounded-full !bg-[var(--green3)] flex items-center justify-center shadow hover:opacity-80 transition">
                        <MoreIcon className="w-9 h-9 fill-[var(--neutral0)]" />
                    </button>

                    <h5>{BankName}</h5>
                    <h2 className="mt-3">${Balance}</h2>
                    <h5 className="text-[var(--green3)] flex items-center gap-2"> 
                        <img src={StreakActive ? StreakOnIcon : StreakOffIcon} className="w-6 h-6 {}fill-[var(--green3)]" />
                        <span className={`${StreakActive ? "text-[var(--green3)]" : "text-[var(--neutral2)]"}`}>{Streak} days</span>
                    </h5>
                    <div className="flex justify-end w-full">
                        <h5>{Progress}%</h5>
                    </div>

                    <div className="w-full h-2 bg-[var(--neutral1)] rounded-full">
                        <div
                            className="h-2 bg-[var(--green3)] rounded-full transition-all duration-300"
                            style={{ width: `${Progress}%` }}
                        ></div>
                    </div>

                </div>
            </div>
        </>
    )
}
export default TrackerCard
