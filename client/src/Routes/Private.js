import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { getUser } from "../util/Util";

export const PrivateRoute = ({children}) => {
    const user = getUser();
    const location = useLocation();
    if (!user) return <Navigate to='/login' replace state={{from:location}} />;
    return children;
};