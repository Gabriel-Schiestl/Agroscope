"use client"
import { FiMenu } from "react-icons/fi";
import { BsFillTelephoneFill } from "react-icons/bs";
import { FaQuestion } from "react-icons/fa";



export default function Navbar() {
    return (
        <div className="bg-green-600 p-5 text-white flex justify-between shadow-sm shadow-black">
            <button className="flex items-center p-2 bg-white text-black rounded shadow-md">
                    <FiMenu/>
            </button>
            <div className="ml-auto flex space-x-4">
                <button className="flex items-center p-2 bg-white text-black rounded shadow-md">Contato <BsFillTelephoneFill/></button>
                <button className="flex items-center p-2 bg-white text-black rounded shadow-md">Sobre nós <FaQuestion/></button>
                <button className="flex items-center p-2 bg-white text-black rounded shadow-md">Como funciona? <FaQuestion></FaQuestion></button>
            </div>
        </div>
    )
}