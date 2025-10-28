
import * as React from 'react';
import { useEffect } from "react";
import { useSnackbar } from "../hooks/snackBar";
import ResponseComponent from "../components/response";
import { } from "../utils/token";
import { useTabManager } from '../states/tabState';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/dashboard';
import TabButton from '../components/tabButton';
import PdfManagement from '../components/pdfManagement';
import KnowledgeSourcesPage from './knowledgeSources';



// Tabs
const TabPanel = ({ children, value, index }: { children: React.ReactNode, value: number, index: number }) => {
    return (
        <div hidden={value !== index}>
            {value === index && children}
        </div>
    );
};


function Admin() {

    const { activeTab, setActiveTab } = useTabManager();
    const { open, message, severity, showSnackbar, handleClose } = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        setActiveTab(1)

    }, [setActiveTab]);

    //logout
    const handleLogout = async () => {
        showSnackbar("logged out", "success",)
        navigate("/");
    }

    return (
        <div className="min-h-screen w-full flex  items-center justify-center">

            <div className="min-h-screen w-[15vw] border border-gray-200 mx-1 flex flex-col items-center justify-around bg-white py-1">
                <div>
                    <img src="/icta-logo.png" alt="ICT Authority Logo" className="h-12" />
                </div>

                <div className='border border-gray-200 h-[80vh] w-[13vw] flex flex-col items-center justify-around'>
                    <div className='text-center'>
                        <h1 className="font-bold text-xl">SmartBot</h1>

                    </div>

                    <div className="h-[40vh] w-[80%] border border-gray-350 rounded-lg mt-5 mb-5 p-2 flex flex-col justify-around">

                        <TabButton prop='Dashboard' onClick={() => { setActiveTab(1) }}></TabButton>
                        <TabButton prop="Knowledge Base" onClick={() => setActiveTab(2)}></TabButton>
                        <TabButton prop="Knowledge Sources" onClick={() => setActiveTab(3)}></TabButton>
                        {/* <TabButton prop="Users" onClick={() => setActiveTab(4)}></TabButton> */}
                        <TabButton prop='Logout' onClick={() => handleLogout()}></TabButton>

                    </div>
                    <div className="h-[20vh] w-[80%] border border-gray-350 rounded-lg mt-3 p-2 flex flex-col text-gray-500 text-center items-center justify-center">
                        <img src="/smartbot.png" alt="ICT Authority Logo" className="h-12" />
                        <p>Smart Academy's Virtual Assistant</p>
                    </div>
                </div>


            </div>
            <div>
                <div className='flex justify-center items-center h-[7vh] mb-2 font-bold text-2xl'>
                    <h1>SmartBot Admin</h1>
                </div>
                <TabPanel value={activeTab} index={1}>
                    <Dashboard></Dashboard>
                </TabPanel> 

                <TabPanel value={activeTab} index={2}>
                    <PdfManagement />
                </TabPanel> 

                <TabPanel value={activeTab} index={3}>
                    <KnowledgeSourcesPage />
                </TabPanel> 

            </div>


            <ResponseComponent
                open={open}
                handleClose={handleClose}
                message={message}
                type={
                    ["success", "error", "warning"].includes(severity)
                        ? (severity as "success" | "error" | "warning")
                        : "error"
                }
            />

        </div >
    )

}

export default Admin