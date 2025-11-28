import { useState } from "react";
import Tracker from "../components/Tracker"
import TrackerCard from "../components/TrackerCard"
import CreateTrackerForm from "../components/CreateTrackerForm";
import GoalCalculator from "../components/GoalCalculator";
import SearchIcon from "../assets/icons/search-outline.svg?react"
import CalculatorIcon from "../assets/icons/calculator-filled.svg?react"



function TrackersPage(){
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showGoalCalculator, setShowGoalCalculator] = useState(false);

    const clientName = "Mac Darren Louis"


    return (
        <>
            <CreateTrackerForm
                show={showCreateForm}
                onClose={() => setShowCreateForm(false)}
            />
            <GoalCalculator
                show={showGoalCalculator}
                onClose={() => setShowGoalCalculator(false)}
            />
            <div className="flex justify-center p-5 h-full">
                <div className="flex flex-col w-full max-w-[95em] max-h-[55em] gap-5 //bg-amber-300 //max-w-[100em] //max-h-[55em]"> 
                    <Tracker/>
                    <div className="w-full h-auto flex justify-between">
                        <div className="flex gap-3">
                            <button className="w-40 shadow-lg" onClick={() => setShowCreateForm(true)} >Add Tracker</button>
                            <button className="w-40 !bg-[var(--green0)] !text-[var(--neutral3)] shadow-lg">Filter Type</button>
                            <button className="w-40 !bg-[var(--green0)] !text-[var(--neutral3)] shadow-lg">Sort</button>
                        </div>
                        <div className="flex gap-3">
                            <button className="w-15 !bg-[var(--green0)] !text-[var(--neutral3)] shadow-lg flex items-center justify-center"
                                onClick={() => setShowGoalCalculator(true)}>
                                <CalculatorIcon className="h-auto w-8 fill-[var(--neutral2)]"/>
                            </button>
                            <div className="relative">
                                <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                                <input
                                    className="w-85 !bg-[var(--neutral0)] shadow-lg"
                                    id="tracker-search"
                                    type="text"
                                    placeholder="Search Tracker"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-110 overflow-y-auto overflow-x-hidden scrollbar-hover scroll-smooth">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
                            <TrackerCard/><TrackerCard/><TrackerCard/><TrackerCard/>
                            <TrackerCard/><TrackerCard/><TrackerCard/><TrackerCard/>
                            <TrackerCard/><TrackerCard/><TrackerCard/><TrackerCard/>
                            <TrackerCard/><TrackerCard/><TrackerCard/><TrackerCard/>
                            <TrackerCard/><TrackerCard/><TrackerCard/><TrackerCard/>
                            <TrackerCard/><TrackerCard/><TrackerCard/><TrackerCard/>
                            <TrackerCard/><TrackerCard/><TrackerCard/><TrackerCard/>
                            <TrackerCard/><TrackerCard/><TrackerCard/><TrackerCard/>
                            <TrackerCard/><TrackerCard/><TrackerCard/><TrackerCard/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default TrackersPage