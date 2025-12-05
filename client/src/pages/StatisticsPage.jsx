import LoadingScreen from "../components/LoadingMode";


function StatisticsPage(){
    const clientName = "Mac Darren Louis"
    return (
        <>
            <div className="flex justify-center p-5">
                Statistics
                <LoadingScreen text={"Fetching Statistics..."}/>
            </div>
        </>
    );
}
export default StatisticsPage