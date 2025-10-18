import HeroSection from "../components/hero";
import Navbar from "../components/navigation";

function Landing() {

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#fef6e9]">
            {/*navigation*/}
            <div className="flex-shrink-0">
                <Navbar />
            </div>
            
            {/*hero section*/}
            <div className="flex-1">
                <HeroSection />
            </div>
        </div>
    );
};

export default Landing;