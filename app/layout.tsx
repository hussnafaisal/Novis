import type {Metadata} from "next";
import "./globals.css";
import Header from "@/components/Header";
import {StoreProvider} from "@/components/StoreProvider";
export const metadata:Metadata={title:"Sveston Luxury AI Suite",description:"Luxury watch commerce suite",icons:{icon:"/icon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><StoreProvider><Header/>{children}</StoreProvider></body></html>}
