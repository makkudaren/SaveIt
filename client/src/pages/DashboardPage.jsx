import TrackerCard from "../components/TrackerCard"
import StreakBadge from "../assets/badges/streakBadge4.svg?react"

function DashboardPage(){
    const clientName = "Mac Darren Louis"
    const fstreakTotalSavedToday = 200
    const fstreakTrackerName = "LandBank"
    const fstreakTrackerSaved = 530
    const fstreakDays = 300
    const fstreakBadge = "Gold"
    const fstreakHighestDays = 450
    const fstreakHighestBadge = "Diamond"
    const fstreakHighestSaved = 1050



    return (
        <>
            <div className="flex justify-center p-5 h-full">
                <div className="flex flex-col w-full max-w-[95em] max-h-[55em] //bg-amber-300 //max-w-[100em] //max-h-[55em]"> 
                    <h1>Hello, {clientName} </h1>
                    <div className="flex flex-row h-full gap-5">
                        <div className="//STREAKS-WIDGET flex flex-col items-center min-w-120 shadow-lg bg-[var(--green0)] rounded-4xl p-5 gap-2">
                            <div className="flex bg-[var(--green0)] justify-center relative z-0 fx-hover-scale mx-1">
                                <div className="flex flex-col justify-center items-center absolute inset-0 z-2 pointer-events-none">
                                    <h2 className="translate-y-2 text-neutral-50 [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">300</h2>
                                    <h3 className="-translate-y-2 text-neutral-50 [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">days</h3>
                                </div>  
                                <StreakBadge className="w-50 h-auto scale-145 streak-badge z-1"/>
                            </div>
                            <h5>Streak Information</h5>
                            <div className="//DYNAMIC flex flex-col w-full h-full gap-3">
                                <div className="flex flex-row gap-3">
                                    <div className="flex flex-col items-center p-3 gap-2 bg-[var(--green1)] w-full h-30 rounded-3xl">
                                        <h5>Activated</h5>
                                        <h2 className="text-[var(--green3)] scale-125">2</h2>
                                    </div>
                                    <div className="flex flex-col items-center p-3 gap-2 bg-[var(--green1)] w-full h-30 rounded-3xl">
                                        <h5>Unactivated</h5>
                                        <h2 className="text-[var(--neutral2)] scale-125">4</h2>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-[var(--green1)] w-full h-full rounded-3xl gap-1">
                                    <h4 className="text-[var(--neutral3)]">----- Today -----</h4>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Total Saved Today:</h5>    
                                        <h5>${fstreakTotalSavedToday}</h5>    
                                    </div>
                                    <h4 className="text-[var(--neutral3)]">----- Current -----</h4>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Tracker Name:</h5>    
                                        <h5>{fstreakTrackerName}</h5>    
                                    </div>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Tracker Saved:</h5>    
                                        <h5>${fstreakTrackerSaved}</h5>    
                                    </div>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Streak Days:</h5>    
                                        <h5>{fstreakDays} days</h5>    
                                    </div>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Streak Badge:</h5>    
                                        <h5>{fstreakBadge}</h5>    
                                    </div>
                                    <h4 className="text-[var(--neutral3)]">----- All Time -----</h4>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Highest Saved</h5>    
                                        <h5>${fstreakHighestSaved}</h5>    
                                    </div>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Highest Streak</h5>    
                                        <h5>{fstreakHighestDays} days</h5>    
                                    </div>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Highest Badge</h5>    
                                        <h5>{fstreakHighestBadge}</h5>    
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="//RIGHT w-full flex flex-col gap-0">
                            <div className="//TRACKER-CONTAINERS flex flex-row gap-x-5 w-255 min-h-56 justify-start overflow-x-auto overflow-y-hidden scrollbar-hover scroll-smooth px-2 snap-x snap-mandatory">
                                <div className="flex flex-row gap-3 justify-start">
                                    <TrackerCard/>
                                    <TrackerCard/>
                                    <TrackerCard/>
                                    <TrackerCard/>
                                    <TrackerCard/>
                                </div>
                            </div>
                            <div className="//STATISTICS-WIDGET w-full h-60 flex mb-5 bg-[var(--green0)] rounded-4xl shadow-lg">

                            </div>
                            <div className="//TRANSACTION-WIDGET w-full h-full flex bg-[var(--green0)] rounded-4xl shadow-lg">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}
export default DashboardPage