"use client"
import { FiMenu } from "react-icons/fi";
import { BsFillTelephoneFill } from "react-icons/bs";
import { FaQuestion } from "react-icons/fa";
import Image from 'next/image';
import Button from "./Button";

export default function Navbar() {
    return (
        <div id="navbar">
            <div className="flex items-center">
                <Image
                    src="/assets/logo_agroscope.jpeg" // Tem que colocar a Logo
                    alt="Logo"
                    width={42}
                    height={42}
                    className="h-12 w-12"
                />
                <span className="ml-4 text-white text-lg font-semibold">AgroScope</span>
            </div>

            <div className="ml-auto flex space-x-4">
                <Button>Contato</Button>
                <Button>Sobre nós</Button>
                <Button>Como funciona?</Button>
                <button id="menu_button"><FiMenu/></button>
            </div>
        </div>
    )
}
