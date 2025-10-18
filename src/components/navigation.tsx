import React from 'react';
import '../styles/navigation.css'

const Navbar: React.FC = () => {
  return (
    <div className='flex flex-col w-full'>
      {/* Top Links*/}
      <div className="governmentLinks text-white p-2 flex flex-row-reverse min-h-[60px] items-center" style={{backgroundColor:"#2e2e2e"}}>
        <a href="https://www.smartacademy.go.ke/" className="hover:text-green-500 text-sm px-2 py-1 border-l border-white">Kenya Education Cloud</a>
        <a href="https://www.smartacademy.go.ke/" className="hover:text-green-500 text-sm px-2 py-1 border-l border-white">Approved ICT Authority Centers</a>
        <a href="https://www.smartacademy.go.ke/" className="hover:text-green-500 text-sm px-2 py-1 border-l border-white">Verify Certificate</a>
        <a href="https://www.smartacademy.go.ke/" className="hover:text-green-500 text-sm px-2 py-1 border-l border-white">GoK Digital Hubs</a>
        <a href="https://www.smartacademy.go.ke/" className="hover:text-green-500 text-sm px-2 py-1 border-l border-white">Public WiFi</a>
        <a href="https://www.smartacademy.go.ke/" className="hover:text-green-500 text-sm px-2 py-1 border-l border-white">Ajira Digital</a>
        <a href="https://www.smartacademy.go.ke/" className="hover:text-green-500 text-sm px-2 py-1 border-l border-white">eWaste Kenya</a>
        <a href="https://www.smartacademy.go.ke/" className="hover:text-green-500 text-sm px-2 py-1">ICT Authority</a>
      </div>
      {/* Bottom Links*/}
      <nav className=" bg-white flex items-center justify-around w-full sticky top-0 z-10 shadow-md min-h-[90px]">
        {/* Logo moved closer to menu */}
        <div className="ictaLogo w-[20%]">
          <img src="/icta-logo.png" alt="ICT Authority Logo" className="h-12" />
        </div>

        <div className='smartLinks w-[70%] flex justify-between'>
          {/* Centered Menu Items with bold and larger text */}
          <div className="flex flex-1 justify-center items-center space-x-10 text-gray-900 mx-4 p-1">
            <a href="https://www.smartacademy.go.ke/" className="hover:text-green-600 font-semibold text-lg">Home</a>
            <a href="https://www.smartacademy.go.ke/" className="hover:text-green-600 font-semibold text-lg">Training</a>
            <a href="https://www.smartacademy.go.ke/" className="hover:text-green-600 font-semibold text-lg">Partner Training</a>
            <a href="https://www.smartacademy.go.ke/" className="hover:text-green-600 font-semibold text-lg">E-Learning</a>
            <a href="https://www.smartacademy.go.ke/" className="hover:text-green-600 font-semibold text-lg">About Us</a>
          </div>

          {/* Right-aligned Action Buttons with consistent styling */}
          <div className="flex items-center space-x-6 mr-35 w-[15%]">
            <a href="/login" className="text-green-700 hover:text-red-600 px-5 py-2 font-semibold text-lg transition duration-300">Login</a>
            <a
              href="/signup"
              className="bg-red-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 font-bold text-lg shadow-md transition duration-300 hover:shadow-xl"
            >
              REGISTER
            </a>
          </div>

        </div>

      </nav>
    </div>
  );
};

export default Navbar;