
import { ReactNode } from "react";



interface InputQuadProps {

  children: ReactNode;

}



const InputQuad = ({ children }: InputQuadProps) => {

  return (

    <div className="bg-green-500 rounded-md p-2 flex flex-col justify-start m-10 shadow-md shadow-black ">

      {children}

    </div>

  );

};



export default InputQuad;
