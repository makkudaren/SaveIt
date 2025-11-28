
import MoreIcon from "../assets/icons/more-vertical-outline.svg?react"
import StreakOnIcon from "../assets/icons/streak-on-indicator.png"
import StreakOffIcon from "../assets/icons/streak-off-indicator.png"

function TrackerCard(){

    const bankName = "LandBank"
    const balance = 4500000000000.67
    const streak = 67
    const progress = 70
    const streakActive = true

    function formatBalance(value) {
    if (value >= 1_000_000_000) {
        return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    }
    if (value >= 1_000_000) {
        return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (value >= 1_000) {
        return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    }

    // default: use commas, 2 decimals
    return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

    return(
        <>  
            <div className="pl-2 snap-start">
                <div className="mb-5 relative flex flex-col justify-between min-w-80 min-h-50 max-w-80 max-h-50 w-80 h-50 bg-[var(--neutral0)] rounded-4xl shadow-lg p-5">
                    
                    <button 
                        className="absolute top-5 right-5 !w-9 !h-9 !rounded-full !bg-[var(--green3)] flex items-center justify-center shadow hover:opacity-80 transition">
                        <MoreIcon className="w-9 h-9 fill-[var(--neutral0)]" />
                    </button>

                    <h5>{bankName}</h5>
                    <h2 className="mt-3">${formatBalance(balance)}</h2>
                    <h5 className="text-[var(--green3)] flex items-center gap-2"> 
                        <img src={streakActive ? StreakOnIcon : StreakOffIcon} className="w-6 h-6 {}fill-[var(--green3)]" />
                        <span className={`${streakActive ? "text-[var(--green3)]" : "text-[var(--neutral2)]"}`}>{streak} days</span>
                    </h5>
                    <div className="flex justify-end w-full">
                        <h5>{progress}%</h5>
                    </div>

                    <div className="w-full h-2 bg-[var(--neutral1)] rounded-full">
                        <div
                            className="h-2 bg-[var(--green3)] rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                </div>
            </div>
        </>
    )
}
export default TrackerCard
