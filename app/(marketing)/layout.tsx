import React from "react";
import {Header} from "./header";
import {Footer} from "@/components/footer";
type Props={
    children: React.ReactNode;
};
const MarketingLayout=({children}:Props)=>{
    return(
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-1 px-14 py-8"> 
                {children}
            </main>
             <Footer/>
        </div>
    );
};

export default MarketingLayout;