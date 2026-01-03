import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContent = createContext()

export const AppContextProvider = (props) => {

    
    axios.defaults.withCredentials = true;
    // Auto-detect environment: use production URL if in production, else development
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const backendUrl = isProduction ? import.meta.env.VITE_BACKEND_URL : import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(false);
    
    const getAuthState = async () => {
        try{
            const { data } = await axios.get(backendUrl+'/api/auth/is-auth');
            if(data.success){
                setIsLoggedin(true);
                getUserData();
            }
        }catch(error){
            const message = error?.response?.data?.message || error?.message || 'Something went wrong';
            toast.error(message);
        }
    }

    const getUserData = async () => {
        try{
            const {data} = await axios.get(backendUrl+'/api/user/data')
            data.success ? setUserData(data.userData) : toast.error(data.message);
        }catch(error){
            toast.error(data.message);
        }
    }

    useEffect(() => {
        getAuthState();
    },[])

    const value = {
        backendUrl,
        isLoggedin,setIsLoggedin,
        userData,setUserData,
        getUserData
    }

    return (
        <AppContent.Provider value={value}>

            {props.children}

        </AppContent.Provider>
    )
}